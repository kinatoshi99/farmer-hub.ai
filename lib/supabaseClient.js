import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.warn('Supabase URL is not defined. Please check your .env.local file for NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  console.warn('Supabase Anon Key is not defined. Please check your .env.local file for NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Helper function to get the current user (client-side)
export const getUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to get the session (client-side)
export const getSession = async () => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Example of how to use it in a component:
// import { supabase } from '@/lib/supabaseClient';
// import { useEffect, useState } from 'react';
//
// function MyComponent() {
//   const [data, setData] = useState(null);
//   useEffect(() => {
//     const fetchData = async () => {
//       if (supabase) {
//         const { data, error } = await supabase.from('your_table_name').select('*');
//         if (error) console.error('Error fetching data:', error);
//         else setData(data);
//       }
//     };
//     fetchData();
//   }, []);
//   return <div>{JSON.stringify(data)}</div>;
// }
