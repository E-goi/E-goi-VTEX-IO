// node/resolvers/getGoidiniOrderStatuses.ts
import type { Clients } from '../clients'
import { ServiceContext } from '@vtex/api'

export async function getGoidiniEgoiOrderStatus(
  _: unknown,
  __: unknown,
  ctx: ServiceContext<Clients>
): Promise<string[]> {
  const {
    clients: { getGoidiniEgoiOrderStatus, apps },
  } = ctx

  const appId = process.env.VTEX_APP_ID!
  if (!appId) {
    throw new Error('No VTEX_APP_ID defined')
  }

  const { apikey, appKey } = (await apps.getAppSettings(appId)) as {
    apikey: string
    appKey: string
  }

  const statuses = await getGoidiniEgoiOrderStatus.getGoidiniEgoiOrderStatusClient(
    apikey,
    appKey
  )

  return statuses
}
