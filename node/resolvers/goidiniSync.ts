import type { GoidiniSync } from '../typings/goidiniSync'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";
import { AppSettings } from '../typings/appSettings';

export async function goidiniSync(
  _: unknown,
  args: any,
  context: ServiceContext<Clients>
): Promise<GoidiniSync> {

  const {
    clients: {
      goidiniSync,
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
    return goidiniSync.saveGoidiniSync(appSettings.apikey, appSettings.appKey, appSettings.appToken, args.input.vtex, args.input.egoi)
  } catch (error) {
    throw new Error(error.message)
  }
}