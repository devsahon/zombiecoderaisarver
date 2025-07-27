import { NextRequest, NextResponse } from 'next/server';
import { getAgents, getAgentById, createAgent, updateAgent, deleteAgent } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const agentId = searchParams.get('id');

    if (agentId) {
      // Get specific agent
      const agent = await getAgentById(parseInt(agentId));
      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Agent not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: agent });
    }

    // Get all agents with optional category filter
    const agents = await getAgents(category);
    
    // Group agents by category
    const groupedAgents = agents.reduce((acc, agent) => {
      const category = agent.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(agent);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      data: {
        agents,
        grouped: groupedAgents,
        summary: {
          total: agents.length,
          categories: Object.keys(groupedAgents),
          active: agents.filter(a => a.status === 'active').length,
          inactive: agents.filter(a => a.status === 'inactive').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, personality, capabilities, config, status = 'active' } = body;

    if (!name || !category || !personality) {
      return NextResponse.json(
        { success: false, error: 'Name, category, and personality are required' },
        { status: 400 }
      );
    }

    const agentData = {
      name,
      category,
      personality,
      capabilities: capabilities || [],
      config: config || {},
      status,
      created_at: new Date(),
      updated_at: new Date()
    };

    const agentId = await createAgent(agentData);
    const newAgent = await getAgentById(agentId);

    return NextResponse.json({
      success: true,
      data: newAgent,
      message: 'Agent created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, category, personality, capabilities, config, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const existingAgent = await getAgentById(parseInt(id));
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const updateData = {
      ...existingAgent,
      ...(name && { name }),
      ...(category && { category }),
      ...(personality && { personality }),
      ...(capabilities && { capabilities }),
      ...(config && { config }),
      ...(status && { status }),
      updated_at: new Date()
    };

    await updateAgent(parseInt(id), updateData);
    const updatedAgent = await getAgentById(parseInt(id));

    return NextResponse.json({
      success: true,
      data: updatedAgent,
      message: 'Agent updated successfully'
    });

  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('id');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const existingAgent = await getAgentById(parseInt(agentId));
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    await deleteAgent(parseInt(agentId));

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
} 