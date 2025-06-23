import type { ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'

export async function hostName(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<{ hosts: string[] }> {
  const {
    clients: { stores },
  } = context

  try {
    const response = await stores.getStores()

    if (!response || !Array.isArray(response) || response.length === 0) {
      throw new Error('No store information found')
    }

    const { hosts = [] } = response[0]

    return {
      hosts,
    }
  } catch (error) {
    throw new Error(`Failed to get hosts: ${error.message}`)
  }
}
