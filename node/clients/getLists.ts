import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GetLists } from '../typings/getLists'

const routes = {
  getListsData: () =>
    `https://dev-api.egoiapp.com/lists`,
}

class GetListsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getLists(apikey: string): Promise<GetLists> {

    let newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'X-Vtex-Use-Https': 'true',
      'Apikey': apikey
    }

    return this.http.get(routes.getListsData(), newOptions)
  }
}

export default GetListsClient