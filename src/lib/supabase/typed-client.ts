import { Database } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export function typedFromTable<T extends keyof Database['public']['Tables']>(
  client: SupabaseClient<Database>,
  table: T
) {
  return client.from(table)
}