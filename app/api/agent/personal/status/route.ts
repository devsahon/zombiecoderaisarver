import { NextResponse } from 'next/server'

const PERSONAL_AGENT_URL = 'http://localhost:8000'

export async function GET() {
    try {
        const response = await fetch(`${PERSONAL_AGENT_URL}/api/agent/personal/status`)
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Personal agent status error:', error)
        return NextResponse.json(
            {
                success: false,
                status: 'inactive',
                message: 'Personal agent server is not running',
                capabilities: []
            },
            { status: 500 }
        )
    }
} 