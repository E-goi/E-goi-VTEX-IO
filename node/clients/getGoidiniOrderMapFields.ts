import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GoidiniOrderMap } from '../typings/goidiniOrderMapResponse'

const routes = {
  getGoidiniOrderMapFieldsData: () =>
    'https://goidini.e-goi.com/vtex-i-o/map-order-status-fields',
}

class GetGoidiniOrderMapFieldsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getGoidiniOrderMapFields(
    apikey: string,
    appKey: string
  ): Promise<GoidiniOrderMap[]> {
    const newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      Apikey: apikey,
      'x-vtex-api-appKey': appKey,
    }

    const response = await this.http.get(
      routes.getGoidiniOrderMapFieldsData(),
      newOptions
    )

    return (response.message ?? []).map((item: any) => ({
      order_type: item.order_type,
      mapping: item.mapping ?? [], // normaliza o mapping
    }))
  }
}

export default GetGoidiniOrderMapFieldsClient
