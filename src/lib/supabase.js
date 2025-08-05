import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and Anon Key must be provided. Check your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to fetch all events
export const fetchEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

// Helper function to subscribe to real-time updates
export const subscribeToEvents = (callback) => {
  const subscription = supabase
    .channel('events')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        (payload) => {
          console.log('Real-time event update:', payload)
          callback(payload)
        }
    )
    .subscribe()

  return subscription
}