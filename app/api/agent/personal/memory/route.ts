import { NextRequest, NextResponse } from 'next/server'

const PERSONAL_AGENT_URL = 'http://localhost:8000'

export async function GET() {
    try {
        const response = await fetch(`${PERSONAL_AGENT_URL}/api/agent/personal/memory`)
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Personal agent memory error:', error)
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: 'Failed to load agent memory'
            },
            { status: 500 }
        )
    }
}

export async function DELETE() {
    try {
        const response = await fetch(`${PERSONAL_AGENT_URL}/api/agent/personal/memory`, {
            method: 'DELETE'
        })
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Personal agent memory clear error:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to clear agent memory'
            },
            { status: 500 }
        )
    }
} 