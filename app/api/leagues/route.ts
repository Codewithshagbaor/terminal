import { fetchLeaguesBySport } from '@/hooks/read/leagues'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sportId = searchParams.get('sportId')

  if (!sportId) return NextResponse.json({ error: 'Missing sportId' }, { status: 400 })

  const data = await fetchLeaguesBySport(sportId)
  return NextResponse.json(data)
}
