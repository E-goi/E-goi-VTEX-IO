import type { ServiceContext } from '@vtex/api'

import type { VtexClient } from '../typings/vtexClientFields'
import type { Clients } from '../clients'
import type { AppSettings } from '../typings/appSettings'

export async function getVtexClientFields(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<VtexClient> {
  const {
    clients: { getVtexClientFields, apps, stores },
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
    return getVtexClientFields.getVtexClientFields(
      appSettings.apikey,
      appSettings.appKey,
      appSettings.appToken,
      name
    )
  } catch (error) {
    throw new Error(error.message)
  }
}
