import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Chatbot Interaction Handler Edge Function starting up...')

serve(async (req: Request) => {
  // This is needed for browser-based invocations
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Ensure environment variables are available
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // Using ANON_KEY here as the chatbot might mostly read public data or user-specific data based on RLS
    // If admin operations are needed, SERVICE_ROLE_KEY would be required and handled carefully.
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.')
    }

    // Create Supabase client with anon key
    // RLS policies on your tables will determine what data can be accessed.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      // Pass the Authorization header from the client to impersonate the user
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })


    const { userInputText, userId } = await req.json() // Assuming userId is also sent for context

    if (!userInputText) {
      return new Response(JSON.stringify({ error: 'userInputText is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`Received user input: "${userInputText}" from user: ${userId || 'anonymous'}`)

    // Placeholder for NLP and intent processing logic
    let responseMessage = `I received your message: "${userInputText}". I am still learning to understand complex requests.`

    // --- Logic Outline ---
    // 1. Preprocess userInputText: Clean, tokenize, etc. (Actual NLP out of scope)
    // 2. Intent Recognition: Determine what the user wants to do.
    //    Examples: 'get crop info', 'show my tasks', 'what to do for [crop] in [stage]?'

    // Example: Simple keyword-based intent detection (very basic)
    if (userInputText.toLowerCase().includes('crop info for')) {
      const cropName = userInputText.split('crop info for')[1]?.trim()
      if (cropName) {
        // 3.a. Query 'crops' table based on intent
        const { data: cropData, error: cropError } = await supabase
          .from('crops')
          .select('crop_name, description, optimal_planting_season')
          .ilike('crop_name', `%${cropName}%`) // Case-insensitive search
          .limit(1)
          .single() // Assuming we want one main result

        if (cropError && cropError.code !== 'PGRST116') { // PGRST116: zero rows found, not necessarily an error for "not found"
            console.error('Error fetching crop info:', cropError)
            responseMessage = `Sorry, I encountered an error trying to fetch information for "${cropName}".`
        } else if (cropData) {
            responseMessage = `Crop: ${cropData.crop_name}\nDescription: ${cropData.description}\nOptimal Planting Season: ${cropData.optimal_planting_season}`
        } else {
            responseMessage = `Sorry, I could not find information for a crop named "${cropName}".`
        }
      } else {
        responseMessage = "Please specify which crop you'd like information about, e.g., 'crop info for tomatoes'."
      }
    } else if (userInputText.toLowerCase().includes('my tasks')) {
        // 3.b. Query 'tasks' table for the user (requires userId and RLS to be effective)
        if (!userId) {
            responseMessage = "I need to know who you are to fetch your tasks. Please ensure you're logged in."
        } else {
            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('task_name, due_date, status')
                .eq('user_id', userId) // RLS should also enforce this
                .eq('status', 'pending') // Example: only pending tasks
                .order('due_date', { ascending: true })
                .limit(5)

            if (tasksError) {
                console.error('Error fetching tasks:', tasksError)
                responseMessage = "Sorry, I encountered an error trying to fetch your tasks."
            } else if (tasks && tasks.length > 0) {
                responseMessage = "Here are your upcoming tasks:\n" + tasks.map(t => `- ${t.task_name} (Due: ${t.due_date}, Status: ${t.status})`).join('\n')
            } else {
                responseMessage = "You have no pending tasks, or I couldn't find any."
            }
        }
    }
    // 3.c. If intent is to create/modify plan:
    //     - This could involve a multi-turn conversation.
    //     - Might eventually call the `task_generation_logic` function or similar.
    //     - Example: "Plan a new tomato crop." -> Bot asks for planting date, field name etc.

    // 4. Formulate and return response.
    // The response can be simple text or a structured JSON for richer UI in the chatbot.

    return new Response(JSON.stringify({ reply: responseMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in chatbot_interaction_handler function:', error)
    return new Response(JSON.stringify({ error: error.message, reply: "Sorry, I encountered an internal error." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

/*
Logic Outline:
1.  Receive `userInputText` and potentially `userId` (or get user from JWT) from the request body.
2.  Security:
    -   Use Anon Key for Supabase client if most operations are read-only on public data or RLS-protected user data.
    -   Pass user's Authorization header to Supabase client to correctly apply RLS policies for user-specific data.
3.  NLP (Placeholder):
    a.  Clean and preprocess `userInputText`.
    b.  Determine user intent (e.g., "get crop info", "list my tasks", "create new plan").
    c.  Extract entities (e.g., crop name, dates).
4.  Database Interaction (based on intent):
    a.  If "get crop info":
        -   Query `crops` or `crop_growth_stages` tables.
        -   Filter based on extracted entities.
    b.  If "list tasks":
        -   Query `tasks` table for the user's tasks.
    c.  If "create plan" or complex actions:
        -   This might involve multiple turns.
        -   Could store conversation state or guide user.
        -   Potentially invoke other Edge Functions like `task_generation_logic`.
5.  Formulate Response:
    -   Based on query results or processed information.
    -   Could be simple text or structured JSON for the chatbot frontend.
6.  Return response.
*/
