/* node/clients/GoidiniOrderMapSyncClient.ts */
import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

// agora importa o Body, não o input do GraphQL
import type {
  GoidiniOrderMapSyncBody,
  GoidiniOrderMapSyncResponse,
} from '../typings/goidiniOrderMapSync'

const routes = {
  orderMap: () => 'https://dev-goidini.e-goi.com/vtex-i-o/order-map-sync',
}

export default class GoidiniOrderMapSyncClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async saveGoidiniOrderMapSync(
    apikey: string,
    appKey: string,
    appToken: string,
    body: GoidiniOrderMapSyncBody
  ): Promise<GoidiniOrderMapSyncResponse> {
    const opts = { ...(this.options as InstanceOptions) }

    opts.headers = {
      'Content-Type': 'application/json',
      Apikey: apikey,
      'x-vtex-api-appKey': appKey,
      'x-vtex-api-appToken': appToken,
    }

    try {
      return await this.http.post(routes.orderMap(), body, opts)
    } catch (err) {
      console.error(err.response?.status, err.response?.data)
      throw err
    }
  }
}
