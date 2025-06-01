import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const routes = {
  getGoidiniEgoiOrderStatusData: () =>
    'https://goidini.e-goi.com/vtex-i-o/egoi-order-status',
}

class GetGoidiniEgoiOrderStatusClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getGoidiniEgoiOrderStatusClient(
    apikey: string,
    appKey: string
  ): Promise<string[]> {
    const newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      Apikey: apikey,
      'x-vtex-api-appKey': appKey,
    }

    const response = await this.http.get(
      routes.getGoidiniEgoiOrderStatusData(),
      newOptions
    )

    return Array.isArray(response.message) ? (response.message as string[]) : []
  }
}

export default GetGoidiniEgoiOrderStatusClient
