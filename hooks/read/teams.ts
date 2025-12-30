import { supabase } from '@/utils/supabase'

export async function fetchTeamsByLeague(leagueId: string, sportId: string) {
  if (!leagueId) throw new Error('Missing leagueId')
  let tableName = 'teams';
  const leagueTableMap: Record<string, string> = {
    'baseball': 'baseball_teams',
    'football': 'football_teams',
    'hockey': 'hockey_teams',
    'soccer': 'soccer_teams',
    'basketball': 'basketball_teams',
  };
  // Check if sportId exists in the mapping
  if (sportId && leagueTableMap[sportId]) {
    tableName = leagueTableMap[sportId];
  }
  const { data, error } = await supabase
    .from(tableName)
    .select('id, name, logo_url')
    .eq('league_id', leagueId);
  if (error) throw new Error(error.message);
  return data;
}