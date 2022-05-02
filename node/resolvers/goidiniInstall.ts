import type { GoidiniInstall } from '../typings/goidiniInstall'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";

export async function goidiniInstall(
  _: unknown,
  args: any,
  context: ServiceContext<Clients>
): Promise<GoidiniInstall> {

  const {
    clients: {
      goidiniInstall,
      stores
    }
  } = context

  const response = await stores.getStores()

  const [store, ,] = response
  const { name } = store

  const appId = process.env.VTEX_APP_ID

  if (!appId) {
    throw new Error('No appId defined')
  }


  try {
    return goidiniInstall.saveGoidiniInstall(args.input.apikey, args.input.appkey, args.input.apptoken, args.input.listId, args.input.domain, name)
  } catch (error) {
    throw new Error(error.message)
  }
}
