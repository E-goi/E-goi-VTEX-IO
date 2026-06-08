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

    const allowedTypes = ['abandoned_cart', 'back_in_stock']

    // Filter by abandoned_cart type and map to the expected format
    return response.items
      .filter((a: any) => allowedTypes.includes(a.type))
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
