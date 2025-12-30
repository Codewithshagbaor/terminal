import { supabase } from '@/utils/supabase'

export async function fetchLeaguesBySport(sportId: string) {
  let tableName = 'leagues';

  // Define a mapping for sportId to table names
  const sportTableMap: Record<string, string> = {
    'baseball': 'baseball_leagues',
    'football': 'football_leagues',
    'hockey': 'hockey_leagues',
    'soccer': 'soccer_leagues',
    'basketball': 'basketball_leagues',
  };

  // Check if sportId exists in the mapping
  if (sportTableMap[sportId]) {
    tableName = sportTableMap[sportId];
  }

  const { data, error } = await supabase
    .from(tableName)
    .select('id, name, logo_url')

  if (error) throw new Error(error.message);
  return data;
}
