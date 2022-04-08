import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { VtexClient } from '../typings/vtexClientFields'

const routes = {
  getVtexClientFieldsData: () =>
    `https://api.vtex.com/egoipartnerpt/dataentities/CL/`,
}

class GetListsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getVtexClientFields(apikey: string, appKey: string, appToken: string): Promise<VtexClient> {

    let newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'X-Vtex-Use-Https': 'true',
      'Apikey': apikey,
      'x-vtex-api-appKey': appKey,
      'x-vtex-api-appToken': appToken
    }

    return this.http.get(routes.getVtexClientFieldsData(), newOptions)
  }
}

export default GetListsClient
