import type { GoidiniInstall } from '../typings/goidiniInstall'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";
import { AppSettings } from '../typings/appSettings';

export async function goidiniInstall(
  _: unknown,
  args: any,
  context: ServiceContext<Clients>
): Promise<GoidiniInstall> {

  const {
    clients: {
      goidiniInstall,
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

  try {
    return goidiniInstall.saveGoidiniInstall(appSettings.apikey, appSettings.appKey, appSettings.appToken, args.input.listId, args.input.domain, name)
  } catch (error) {
    throw new Error(error.message)
  }
}
