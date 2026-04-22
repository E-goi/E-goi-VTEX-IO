import type { ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'

export async function getAutomations(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<any> {
  const {
    clients: { apps, automations },
  } = context

  const appId = process.env.VTEX_APP_ID

  if (!appId) {
    throw new Error('App ID not found')
  }

  try {
    const settings = await apps.getAppSettings(appId)
    const apikey = settings.apikey

    if (!apikey) {
      return []
    }

    const response = await automations.getAutomations(apikey)

    if (!response || !Array.isArray(response.items)) {
      return []
    }

    // Filter by abandoned_cart and welcome types and map to the expected format
    return response.items
      .filter((a: any) => a.type === 'abandoned_cart' || a.type === 'welcome')
      .map((a: any) => ({
        paused: a.paused,
        type: a.type,
        domain: a.url || a.domain || '',
      }))
  } catch (error) {
    console.error('Error fetching automations:', error)
    return []
  }
}
