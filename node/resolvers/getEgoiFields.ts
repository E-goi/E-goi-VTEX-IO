import type { EgoiFields } from '../typings/egoiFields'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";
import { AppSettings } from '../typings/appSettings';

export async function getEgoiFields(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<EgoiFields> {

  const {
    clients: {
      getEgoiFields,
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
    return getEgoiFields.getEgoiFieds(appSettings.apikey, appSettings.listId)
  } catch (error) {
    throw new Error(error.message)
  }
}