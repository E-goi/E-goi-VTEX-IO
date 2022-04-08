import type { ServiceContext } from '@vtex/api'

import type { Clients } from '../clients'
import type { GetAppSettings } from '../typings/appSettings'

export async function getAppSettings(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<GetAppSettings> {
  const {
    clients: { apps },
  } = context

  const appId = process.env.VTEX_APP_ID

  if (!appId) {
    throw new Error(appId)
  }

  try {
    //const settings = await apps.getAppSettings(appId)
    return apps.getAppSettings(appId)

  } catch (error) {

    throw new Error(error.message)
  }

}

