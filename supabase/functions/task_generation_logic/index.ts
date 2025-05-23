import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Task Generation Logic Edge Function starting up...')

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Ensure environment variables are available
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Use service role key for admin-level operations

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { crop_plan_id } = await req.json()

    if (!crop_plan_id) {
      return new Response(JSON.stringify({ error: 'crop_plan_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`Processing task generation for crop_plan_id: ${crop_plan_id}`)

    // 1. Retrieve the crop_plan details
    const { data: cropPlan, error: cropPlanError } = await supabaseAdmin
      .from('crop_plans')
      .select('id, user_id, crop_id, planting_date, farm_id') // farm_id might be useful for context
      .eq('id', crop_plan_id)
      .single()

    if (cropPlanError) throw cropPlanError
    if (!cropPlan) {
      return new Response(JSON.stringify({ error: 'Crop plan not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const { user_id, crop_id, planting_date } = cropPlan
    const planPlantingDate = new Date(planting_date)

    // 2. Retrieve the crop_growth_stages for the given crop_id
    const { data: growthStages, error: stagesError } = await supabaseAdmin
      .from('crop_growth_stages')
      .select('id, stage_name, duration_days, activities_recommended, order_in_sequence')
      .eq('crop_id', crop_id)
      .order('order_in_sequence', { ascending: true })

    if (stagesError) throw stagesError
    if (!growthStages || growthStages.length === 0) {
      return new Response(JSON.stringify({ error: 'No growth stages found for this crop' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // 3. Iterate through each growth stage and generate tasks
    const tasksToInsert = []
    let currentStageStartDate = new Date(planPlantingDate) // Initialize with the plan's planting date

    for (const stage of growthStages) {
      const stageStartDate = new Date(currentStageStartDate)
      const stageEndDate = new Date(stageStartDate)
      stageEndDate.setDate(stageEndDate.getDate() + stage.duration_days)

      // Generate task objects based on activities_recommended or a default task
      // This is a placeholder - actual task generation logic will be more complex
      const taskName = stage.activities_recommended
        ? `Tasks for ${stage.stage_name}: ${stage.activities_recommended}`
        : `Complete ${stage.stage_name}`

      tasksToInsert.push({
        crop_plan_id: crop_plan_id,
        user_id: user_id, // User ID from the crop plan
        growth_stage_id: stage.id, // Link task to the specific growth stage
        task_name: taskName,
        description: `Activities related to ${stage.stage_name} for the crop.`,
        scheduled_date: stageStartDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        due_date: stageEndDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        status: 'pending', // Default status
        priority: 0, // Default priority
      })

      // Update currentStageStartDate for the next iteration
      currentStageStartDate = new Date(stageEndDate)
      currentStageStartDate.setDate(currentStageStartDate.getDate() + 1) // Next stage starts the day after the previous one ends
    }

    // 4. Insert generated tasks into the tasks table
    if (tasksToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin.from('tasks').insert(tasksToInsert)
      if (insertError) throw insertError
      console.log(`Successfully inserted ${tasksToInsert.length} tasks for crop_plan_id: ${crop_plan_id}`)
    } else {
      console.log(`No tasks generated for crop_plan_id: ${crop_plan_id}`)
    }

    return new Response(JSON.stringify({ message: 'Tasks generated successfully', generated_tasks_count: tasksToInsert.length, tasks: tasksToInsert }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in task_generation_logic function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

/*
Logic Outline:
1.  Receive `crop_plan_id` from the request body.
2.  Security: Ensure the user invoking this function has permissions to modify the crop plan or that this is a trusted operation (e.g., invoked by a trigger or another secure process). For direct invocation, use Supabase RLS or check user roles. Here, we use service_role_key assuming it's a trusted backend operation.
3.  Database Operations:
    a.  Fetch `crop_plan` details:
        -   `crop_id`
        -   `planting_date`
        -   `user_id` (to assign tasks to the correct user)
    b.  Fetch `crop_growth_stages` for the `crop_id`:
        -   `stage_name`
        -   `duration_days`
        -   `activities_recommended` (or similar field for task details)
        -   `order_in_sequence` (crucial for correct date calculations)
    c.  Calculate task dates:
        -   Iterate through `crop_growth_stages` in order.
        -   The first stage starts on `planting_date`.
        -   Subsequent stages start after the previous stage's `duration_days`.
        -   `scheduled_date` could be the start of the stage.
        -   `due_date` could be the end of the stage.
    d.  Generate task objects:
        -   For each stage, create one or more tasks.
        -   Task details: `crop_plan_id`, `user_id`, `growth_stage_id` (optional link), `task_name`, `description`, `scheduled_date`, `due_date`, `status` ('pending').
        -   `task_name` could be derived from `stage_name` or `activities_recommended`.
    e.  Batch insert tasks into the `tasks` table.
4.  Return a success response with the number of tasks created or an error response.
*/
