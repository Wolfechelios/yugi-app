import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://db.ygoprodeck.com/api/v7'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  try {
    // Build the external API URL with all query parameters
    const externalUrl = `${API_BASE_URL}/cardinfo.php?${searchParams.toString()}`
    
    console.log('Proxying request to:', externalUrl)
    
    const response = await fetch(externalUrl, {
      headers: {
        'User-Agent': 'DuelVault-YuGiOh-Manager/1.0',
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText)
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // Handle API error responses
    if (data.error) {
      console.error('API returned error:', data.error)
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      )
    }
    
    // Return the data with proper CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Yu-Gi-Oh! API' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}