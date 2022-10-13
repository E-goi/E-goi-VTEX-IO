import type { ServiceContext } from '@vtex/api'

import type { GoidiniResponse } from '../typings/goidiniResponse'
import type { Clients } from '../clients'
import type { AppSettings } from '../typings/appSettings'

export async function createConnectedSites(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<GoidiniResponse> {
  const {
    clients: { createConnectedSites, apps, stores },
  } = context

  const appId = process.env.VTEX_APP_ID

  const response = await stores.getStores()

  const [store, ,] = response
  const { name } = store

  if (!appId) {
    throw new Error('No appId defined')
  }

  const appSettings = ((await apps.getAppSettings(appId)) ?? {}) as AppSettings

  try {
    return createConnectedSites.createConnectedSites(
      appSettings.apikey,
      name,
      appSettings.domain,
      appSettings.listId
    )
  } catch (error) {
    throw new Error(error.message)
  }
}
