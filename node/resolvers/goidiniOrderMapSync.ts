import type { ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'
import type {
  GoidiniOrderMapSyncBody,
  OrderMappingRecord,
  GoidiniOrderMapSyncResponse,
  GoidiniOrderMapSyncInput,
  StatusPairInput,
} from '../typings/goidiniOrderMapSync'
import type { AppSettings } from '../typings/appSettings'

const toRecord = (mapping: StatusPairInput[]): Record<string,string> =>
  mapping.reduce((acc, cur) => {
    acc[cur.appStatus] = cur.egoiStatus
    return acc
  }, {} as Record<string,string>)

export async function goidiniOrderMapSync(
  _: unknown,
  args: { input: GoidiniOrderMapSyncInput },
  ctx: ServiceContext<Clients>
): Promise<GoidiniOrderMapSyncResponse> {
  const {
    clients: { goidiniOrderMapSync, apps },
  } = ctx

  const appId = process.env.VTEX_APP_ID
  if (!appId) throw new Error('No appId defined')
  const settings = (await apps.getAppSettings(appId)) as AppSettings

  const payloads = args.input.payload
  if (!payloads?.length) throw new Error('Payload vazio')

  const transformed: OrderMappingRecord[] = payloads.map(
    ({ order_type, mapping }) => ({
      order_type,
      mapping: toRecord(mapping),
    })
  )

  const body: GoidiniOrderMapSyncBody = { payload: transformed }

  try {
    return await goidiniOrderMapSync.saveGoidiniOrderMapSync(
      settings.apikey,
      settings.appKey,
      settings.appToken,
      body
    )
  } catch (error) {
    throw new Error(error.message)
  }
}
