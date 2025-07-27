import { NextRequest, NextResponse } from 'next/server';

const DISPATCHER_URL = process.env.DISPATCHER_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { input, context } = body;

        if (!input) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No input provided',
                    message: 'ইনপুট প্রয়োজন'
                },
                { status: 400 }
            );
        }

        // Call MCP Dispatcher
        const response = await fetch(`${DISPATCHER_URL}/api/dispatcher`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input, context }),
        });

        if (!response.ok) {
            throw new Error(`Dispatcher API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Dispatcher API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to connect to dispatcher',
                message: 'ডিসপ্যাচার সার্ভার অ্যাক্সেস করতে সমস্যা'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Get dispatcher status
        const response = await fetch(`${DISPATCHER_URL}/api/dispatcher/status`);
        
        if (!response.ok) {
            throw new Error(`Dispatcher status error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Dispatcher status error:', error);
        return NextResponse.json(
            {
                success: false,
                status: 'inactive',
                message: 'Dispatcher server is not running',
                agents_loaded: 0,
                providers_loaded: 0
            },
            { status: 500 }
        );
    }
} 