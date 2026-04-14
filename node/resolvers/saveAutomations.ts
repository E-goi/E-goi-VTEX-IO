import type { ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'

interface SaveAutomationsArgs {
  input: {
    paused: boolean
    domain: string
  }
}

export async function saveAutomations(
  _: unknown,
  { input }: SaveAutomationsArgs,
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
      throw new Error('API Key not found in settings')
    }

    const payload = {
      paused: input.paused,
      domain: input.domain,
      type: 'abandoned_cart',
    }

    const response = await automations.saveAutomation(apikey, payload)
    
    return response
  } catch (error) {
    console.error('Error saving automation:', error)
    throw new Error(error.message || 'Failed to update automation status')
  }
}
