import type { GoidiniResponse } from '../typings/goidiniResponse'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";
import { AppSettings } from '../typings/appSettings';

export async function createConnectedSites(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<GoidiniResponse> {

  const {
    clients: {
      createConnectedSites,
      apps
    }
  } = context

  const appId = process.env.VTEX_APP_ID

  if (!appId) {
    throw new Error('No appId defined')
  }

  const appSettings = ((await apps.getAppSettings(
    appId
  )) ?? {}) as AppSettings

  try {
    return createConnectedSites.createConnectedSites(appSettings.apikey, appSettings.appKey, appSettings.domain, appSettings.listId)
  } catch (error) {
    throw new Error(error.message)
  }
}
