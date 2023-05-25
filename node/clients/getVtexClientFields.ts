import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

import type { VtexClient } from '../typings/vtexClientFields'

const routes = {
  getVtexClientFieldsData: (name: string, acronym: string) =>
    `https://api.vtex.com/${name}/dataentities/${acronym}/`,
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

  public async getVtexClientFields(name: string, acronym: string): Promise<VtexClient> { 
    return this.http.get(routes.getVtexClientFieldsData(name, acronym), this.options)
  }
}

export default GetListsClient
