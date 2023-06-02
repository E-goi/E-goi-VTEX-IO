import type { GoidiniSettingsResponse } from '../typings/goidiniSettings'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";
import { AppSettings } from '../typings/appSettings';

export async function goidiniSettings(
  _: unknown,
  args: any,
  context: ServiceContext<Clients>
): Promise<GoidiniSettingsResponse> {

  const {
    clients: {
      goidiniSettings,
      apps,
      stores
    }
  } = context


  const response = await stores.getStores()

  const [store, ,] = response
  const { name } = store

  const appId = process.env.VTEX_APP_ID

  if (!appId) {
    throw new Error('No appId defined')
  }

  const appSettings = ((await apps.getAppSettings(
    appId
  )) ?? {}) as AppSettings

  let apikey = args.apikey ? args.apikey : appSettings.apikey
  try {
    return goidiniSettings.goidiniSettings(apikey, appSettings.appKey, appSettings.appToken, name)
  } catch (error) {
    throw new Error(error.message)
  }
}