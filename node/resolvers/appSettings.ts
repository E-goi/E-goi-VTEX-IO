import type { ServiceContext } from '@vtex/api'

import type { Clients } from '../clients'
import type { AppSettings } from '../typings/appSettings'

export async function saveAppSettings(
  _: unknown,
  args: any,
  context: ServiceContext<Clients>
): Promise<Boolean> {
  const {
    clients: { apps },
  } = context

  const appId = process.env.VTEX_APP_ID

  if (!appId) {
    return false
  }

  const appSettings = ((await apps.getAppSettings(
    appId
  )) ?? {}) as AppSettings

  try {
    appSettings.appKey = args.input.appKey ?? (appSettings.appKey ?? null)
    appSettings.appToken = args.input.appToken ?? (appSettings.appToken ?? null)
    appSettings.apikey = args.input.apikey ?? (appSettings.apikey ?? null)
    appSettings.pixelActive = args.input.pixelActive ?? (appSettings.pixelActive ?? null)
    appSettings.clientId = args.input.clientId ?? (appSettings.clientId ?? null)
    appSettings.domain = args.input.domain ?? (appSettings.domain ?? null)
    appSettings.listId = args.input.listId ?? (appSettings.listId ?? null)
    appSettings.connectedSites = args.input.connectedSites ?? (appSettings.connectedSites ?? null)
    appSettings.vtex = args.input.vtex ?? (appSettings.vtex ?? [])
    appSettings.egoi = args.input.egoi ?? (appSettings.egoi ?? [])

    await apps.saveAppSettings(appId, appSettings)

    return true

  } catch (error) {

    throw new Error(error)
  }

}