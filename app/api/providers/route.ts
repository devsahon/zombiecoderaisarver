import { NextResponse } from 'next/server';
import { getProviders, getActiveProviders, updateProviderStatus, addProviderLog } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const activeOnly = searchParams.get('active') === 'true';

    let providers;
    if (activeOnly) {
      providers = await getActiveProviders(type || undefined);
    } else {
      providers = await getProviders(type || undefined);
    }

    return NextResponse.json({
      success: true,
      data: providers,
      count: providers.length
    });
  } catch (error) {
    console.error('Providers API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, providerId, isActive, config } = await request.json();

    switch (action) {
      case 'toggle_status':
        if (providerId === undefined || isActive === undefined) {
          return NextResponse.json(
            { success: false, error: 'Provider ID and status are required' },
            { status: 400 }
          );
        }
        
        await updateProviderStatus(providerId, isActive);
        
        // Log the action
        await addProviderLog(
          providerId,
          'status_change',
          undefined,
          undefined,
          undefined,
          'success',
          `Provider ${isActive ? 'activated' : 'deactivated'}`
        );

        return NextResponse.json({
          success: true,
          message: `Provider ${isActive ? 'activated' : 'deactivated'} successfully`
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Provider update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update provider' },
      { status: 500 }
    );
  }
} 