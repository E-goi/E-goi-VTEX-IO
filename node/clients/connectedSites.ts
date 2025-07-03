import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GoidiniResponse } from '../typings/goidiniResponse'

const routes = {
  getConnectedSitesData: () => `https://goidini.e-goi.com/vtex-i-o/connected-sites`,
}

class ConnectedSitesClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      '',
      context,
      { ...(options ?? {}), retries: 0 }
    )
  }


  public async createConnectedSites(
    apikey: string,
    appName: string,
    domain: string,
    listId: number,
    appKey: string,
  ): Promise<GoidiniResponse> {
    const newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'X-Vtex-Use-Https': 'true',
      Apikey: apikey,
      'vtex-appName': appName,
      'x-vtex-api-appKey': appKey,
    }

    return this.http.post(
      routes.getConnectedSitesData(),
      { domain, list_id: listId },
      newOptions
    )
  }
}

export default ConnectedSitesClient
