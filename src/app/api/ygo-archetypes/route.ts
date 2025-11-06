import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://db.ygoprodeck.com/api/v7'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/archetypes.php`, {
      headers: {
        'User-Agent': 'DuelVault-YuGiOh-Manager/1.0',
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    
  } catch (error) {
    console.error('Error fetching archetypes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archetypes' },
      { status: 500 }
    )
  }
}