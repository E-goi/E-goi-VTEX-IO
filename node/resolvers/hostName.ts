import type { ServiceContext } from '@vtex/api'

import type { Clients } from '../clients'

export async function hostName(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<string> {
  const {
    clients: { stores },
  } = context

  try {
    const response = await stores.getStores()

    const [store, ,] = response
    if (!response) {
      throw new Error('boas')
    }
    const { hosts } = store
    const [host, ,] = hosts

    return host
  } catch (error) {
    throw new Error(error.message)
  }
}
