import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

import type { VtexClient } from '../typings/vtexClientFields'

const routes = {
  getVtexClientFieldsData: (name: string) =>
    `https://api.vtex.com/${name}/dataentities/CL/`,
}

class GetListsClient extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: context.authToken,
      },
    })
  }

  public async getVtexClientFields(
    apikey: string,
    appKey: string,
    appToken: string,
    name: string
  ): Promise<VtexClient> {
    const newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'X-Vtex-Use-Https': 'true',
      Apikey: apikey,
      'x-vtex-api-appKey': appKey,
      'x-vtex-api-appToken': appToken,
    }

    return this.http.get(routes.getVtexClientFieldsData(name), this.options)
  }
}

export default GetListsClient
