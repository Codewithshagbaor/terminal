import { fetchTeamsByLeague } from '@/hooks/read/teams'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const leagueId = searchParams.get('leagueId')
  const sportId = searchParams.get('sportId')


  if (!leagueId) return NextResponse.json({ error: 'Missing leagueId' }, { status: 400 })

  const data = await fetchTeamsByLeague(leagueId, sportId || '')
  return NextResponse.json(data)
}
