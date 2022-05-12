import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { MyAccount } from '../typings/myAccount'

const routes = {
  getMyAccountData: () =>
    `https://api.egoiapp.com/my-account`,
}
class MyAccountClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getMyAccountData(apikey: string): Promise<MyAccount> {

    let newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'X-Vtex-Use-Https': 'true',
      'Apikey': apikey
    }

    return this.http.get(routes.getMyAccountData(), newOptions)
  }
}

export default MyAccountClient
