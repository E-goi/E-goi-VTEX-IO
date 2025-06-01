import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GoidiniResponse } from '../typings/goidiniResponse'

const routes = {
  orderBulkSync: () => 'https://goidini.e-goi.com/vtex-i-o/order-bulk-sync',
}

export default class GoidiniOrderBulkSyncClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, { ...(options || {}), retries: 0 })
  }

  public async triggerBulk(
    apikey: string,
    appKey: string,
    appToken: string,
    flag: boolean
  ): Promise<GoidiniResponse> {
    const opts = { ...(this.options as InstanceOptions) }

    opts.headers = {
      'Content-Type': 'application/json',
      Apikey: apikey,
      'x-vtex-api-appKey': appKey,
      'x-vtex-api-appToken': appToken,
    }

    const payload = { bulk: flag }

    try {
      return await this.http.post(routes.orderBulkSync(), payload, opts)
    } catch (error) {
      console.error(error.response?.status, error.response?.data)
      throw error
    }
  }
}
