import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GoidiniResponse } from '../typings/goidiniResponse'

const routes = {
  getConnectedSitesData: () =>
    `https://goidini.e-goi.com/vtex-io/connected-sites`,
}
class ConnectedSitesClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async createConnectedSites(apikey: string, appKey: string, domain: string, listId: Number): Promise<GoidiniResponse> {

    let newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'X-Vtex-Use-Https': 'true',
      'Apikey': apikey,
      'x-vtex-api-appKey': appKey
    }

    return this.http.post(routes.getConnectedSitesData(), { 'domain': domain, 'list_id': listId }, newOptions)
  }
}

export default ConnectedSitesClient
