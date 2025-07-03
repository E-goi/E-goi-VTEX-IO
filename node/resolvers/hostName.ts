import type { ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'

export async function hostName(
  _: unknown,
  __: unknown,
  context: ServiceContext<Clients>
): Promise<{ hosts: string[] }> {
  const {
    clients: { stores },
    vtex: { account },
  } = context

  try {
    const response = await stores.getStores()

    if (!response || !Array.isArray(response)) {
      throw new Error('No store information found')
    }

    const store = response.find(
      (s: any) => s && Array.isArray(s.hosts) && s.hosts.length > 0
    )

    const hosts = store?.hosts ?? [`${account}.vtex.com`]


    return {
      hosts,
    }
  } catch (error) {
    throw new Error(`Failed to get hosts: ${error?.message ?? error}`)
  }
}
