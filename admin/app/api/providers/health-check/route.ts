import { NextResponse } from 'next/server'
import { getProviders, updateProviderStatus, addProviderLog } from '@/lib/database'

export async function GET() {
  try {
    const providers = await getProviders()
    const healthStatus: Record<number, boolean> = {}

    // Check health for each provider
    for (const provider of providers) {
      try {
        let isHealthy = false

        // Check based on provider type
        switch (provider.type) {
          case 'ai':
            // Check AI server health
            try {
              const response = await fetch('http://localhost:8002/api/health', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000) // 5 second timeout
              })
              if (response.ok) {
                const data = await response.json()
                isHealthy = data.status === 'healthy'
              }
            } catch (error) {
              console.error(`AI server health check failed for provider ${provider.id}:`, error)
            }
            break

          case 'tts':
          case 'stt':
            // Check voice server health
            try {
              const response = await fetch('http://localhost:8001/api/status', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
              })
              if (response.ok) {
                const data = await response.json()
                isHealthy = data.status === 'running' || data.status === 'online'
              }
            } catch (error) {
              console.error(`Voice server health check failed for provider ${provider.id}:`, error)
            }
            break

          case 'news':
          case 'weather':
            // Check external API health
            try {
              const response = await fetch(provider.api_url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(10000) // 10 second timeout for external APIs
              })
              isHealthy = response.ok
            } catch (error) {
              console.error(`External API health check failed for provider ${provider.id}:`, error)
            }
            break

          default:
            // Default health check
            isHealthy = provider.is_active
        }

        healthStatus[provider.id] = isHealthy

        // Log health check result
        await addProviderLog(
          provider.id,
          'health_check',
          undefined,
          undefined,
          undefined,
          isHealthy ? 'success' : 'error',
          `Health check ${isHealthy ? 'passed' : 'failed'}`
        )

        // Update provider status if health changed
        if (provider.is_active && !isHealthy) {
          await updateProviderStatus(provider.id, false)
        }

      } catch (error) {
        console.error(`Health check error for provider ${provider.id}:`, error)
        healthStatus[provider.id] = false
      }
    }

    return NextResponse.json({
      success: true,
      health_status: healthStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Provider health check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform health check' },
      { status: 500 }
    )
  }
} 