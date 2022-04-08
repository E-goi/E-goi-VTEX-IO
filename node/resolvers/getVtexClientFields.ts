import type { VtexClient } from '../typings/vtexClientFields'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";
import { AppSettings } from '../typings/appSettings';

export async function getVtexClientFields(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<VtexClient> {

  const {
    clients: {
      getVtexClientFields,
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
    return getVtexClientFields.getVtexClientFields(appSettings.apikey, appSettings.appKey, appSettings.appToken)
  } catch (error) {
    throw new Error(error.message)
  }
}
