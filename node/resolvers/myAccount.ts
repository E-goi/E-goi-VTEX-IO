import { MyAccount } from "../typings/myAccount";

import type { Clients } from '../clients'
import { ServiceContext } from "@vtex/api";

export async function myAccount(
  _: unknown,
  args: any,
  context: ServiceContext<Clients>
): Promise<MyAccount> {

  const {
    clients: {
      myAccount
    }
  } = context

  try {
    let apikey = args.apikey ? args.apikey : ''
    return myAccount.getMyAccountData(apikey)
  } catch (error) {
    throw new Error(error.message)
  }
}