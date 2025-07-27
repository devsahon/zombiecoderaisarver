import { NextResponse } from 'next/server'
import { getDispatcherRules, addDispatcherRule, deleteDispatcherRule, updateDispatcherRule } from '@/lib/database'

export async function GET() {
  try {
    const rules = await getDispatcherRules()
    
    return NextResponse.json({
      success: true,
      data: rules,
      count: rules.length
    })
  } catch (error) {
    console.error('Dispatcher rules API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch routing rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { action, rule } = await request.json()

    switch (action) {
      case 'add_rule':
        if (!rule.name || !rule.input_pattern || !rule.provider_type) {
          return NextResponse.json(
            { success: false, error: 'Rule name, pattern, and provider type are required' },
            { status: 400 }
          )
        }

        const newRule = await addDispatcherRule({
          name: rule.name,
          input_pattern: rule.input_pattern,
          provider_type: rule.provider_type,
          provider_id: rule.provider_id || null,
          priority: rule.priority || 1,
          is_active: rule.is_active !== false
        })

        return NextResponse.json({
          success: true,
          rule: newRule,
          message: 'Routing rule added successfully'
        })

      case 'update_rule':
        if (!rule.id) {
          return NextResponse.json(
            { success: false, error: 'Rule ID is required' },
            { status: 400 }
          )
        }

        await updateDispatcherRule(rule.id, rule)

        return NextResponse.json({
          success: true,
          message: 'Routing rule updated successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Dispatcher rules update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update routing rules' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { action, ruleId } = await request.json()

    if (action !== 'delete_rule' || !ruleId) {
      return NextResponse.json(
        { success: false, error: 'Action and rule ID are required' },
        { status: 400 }
      )
    }

    await deleteDispatcherRule(ruleId)

    return NextResponse.json({
      success: true,
      message: 'Routing rule deleted successfully'
    })
  } catch (error) {
    console.error('Dispatcher rules delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete routing rule' },
      { status: 500 }
    )
  }
} 