import type { ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'
import type { GoidiniResponse } from '../typings/goidiniResponse'

export async function goidiniOrderSyncBulk(
  _: unknown,
  args: { input: boolean },
  ctx: ServiceContext<Clients>
): Promise<GoidiniResponse> {
  const {
    clients: { goidiniOrderBulkSync, apps },
  } = ctx

  // pega as credenciais do app
  const appId = process.env.VTEX_APP_ID
  if (!appId) throw new Error('No appId defined')
  const settings = await apps.getAppSettings(appId)

  try {
    return await goidiniOrderBulkSync.triggerBulk(
      settings.apikey,     // 1️⃣ apikey
      settings.appKey,     // 2️⃣ appKey
      settings.appToken,   // 3️⃣ appToken
      args.input           // 4️⃣ flag boolean
    )
  } catch (error) {
    throw new Error(error.message)
  }
}
