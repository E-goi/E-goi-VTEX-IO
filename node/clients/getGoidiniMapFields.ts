import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GoidiniMapResponse } from '../typings/goidiniMapResponse'

const routes = {
  getGoidiniMapFieldsData: () => `https://goidini.e-goi.com/vtex-i-o/map-fields`, // CHANGE DEV TO PROD
}

class GetGoidiniMapFieldsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getGoidiniMapFields(
    apikey: string,
    appKey: string
  ): Promise<GoidiniMapResponse> {
    const newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      Apikey: apikey,
      'x-vtex-api-appKey': appKey
    }

    return this.http.get(
      routes.getGoidiniMapFieldsData(),
      newOptions
    )
  }
}

export default GetGoidiniMapFieldsClient
