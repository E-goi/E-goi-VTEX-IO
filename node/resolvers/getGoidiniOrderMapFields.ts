// node/resolvers/getGoidiniOrderMapFields.ts
import type { GoidiniOrderMap } from '../typings/goidiniOrderMapResponse'
import type { Clients } from '../clients'
import { ServiceContext } from '@vtex/api'
import { AppSettings } from '../typings/appSettings'

export async function getGoidiniOrderMapFields(
  _: unknown,
  __: unknown,
  ctx: ServiceContext<Clients>
): Promise<GoidiniOrderMap[]> {
  const {
    clients: { getGoidiniOrderMapFields, apps },
  } = ctx

  const appId = process.env.VTEX_APP_ID!
  if (!appId) throw new Error('No appId defined')

  const { apikey, appKey } = (await apps.getAppSettings(appId)) as AppSettings

  const rawList = await getGoidiniOrderMapFields
    .getGoidiniOrderMapFields(apikey, appKey)

  return rawList.map((item) => {
    let mappingArray: { appStatus: string; egoiStatus: string }[]

    if (Array.isArray(item.mapping)) {
      mappingArray = item.mapping
    } else if (item.mapping && typeof item.mapping === 'object') {
      const obj = item.mapping as Record<string, string>
      mappingArray = Object.entries(obj).map(
        ([appStatus, egoiStatus]) => ({
          appStatus,
          egoiStatus,   // agora TS sabe que é string
        })
      )
    } else {
      mappingArray = []
    }

    return {
      order_type: item.order_type,
      mapping: mappingArray,
    }
  })
}
