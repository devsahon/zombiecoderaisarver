import { NextRequest, NextResponse } from 'next/server'

const PERSONAL_AGENT_URL = 'http://localhost:8000'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const response = await fetch(`${PERSONAL_AGENT_URL}/api/agent/personal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Personal agent API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to connect to personal agent server',
                message: 'Personal agent server is not running or not accessible'
            },
            { status: 500 }
        )
    }
} 