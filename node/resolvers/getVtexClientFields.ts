import type { ServiceContext } from '@vtex/api'

import type { VtexClient } from '../typings/vtexClientFields'
import type { Clients } from '../clients'

export async function getVtexClientFields(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<VtexClient> {
  const {
    clients: { getVtexClientFields, stores },
  } = context

  const appId = process.env.VTEX_APP_ID

  const response = await stores.getStores()

  const [store, ,] = response
  const { name } = store

  if (!appId) {
    throw new Error('No appId defined')
  }

  try {
    return getVtexClientFields.getVtexClientFields(name)
  } catch (error) {
    throw new Error(error.message)
  }
}
