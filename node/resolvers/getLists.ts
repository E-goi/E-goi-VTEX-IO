import type { GetLists } from '../typings/getLists'

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";

export async function getLists(
  _: unknown,
  args: any,
  context: ServiceContext<Clients>
): Promise<GetLists> {

  const {
    clients: {
      getLists
    }
  } = context

  try {
    let apikey = args.apikey ? args.apikey : ''
    return getLists.getLists(apikey)
  } catch (error) {
    throw new Error(error.message)
  }
}