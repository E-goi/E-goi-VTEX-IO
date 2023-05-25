import type { GoidiniMapResponse } from '../typings/goidiniMapResponse'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";
import { AppSettings } from '../typings/appSettings';

export async function getGoidiniMapFields(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<GoidiniMapResponse> {

  const {
    clients: {
      getGoidiniMapFields,
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
    return getGoidiniMapFields.getGoidiniMapFields(appSettings.apikey, appSettings.appKey)
  } catch (error) {
    throw new Error(error.message)
  }
}