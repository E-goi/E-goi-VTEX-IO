import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GoidiniInstall } from '../typings/goidiniInstall'

const routes = {
  getGoidiniInstallData: () => `https://goidini.e-goi.com/vtex-i-o/install`,
}

class GoidiniInstallClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async saveGoidiniInstall(
    apikey: string,
    appKey: string,
    appToken: string,
    listId: number,
    storeUrl: string,
    storeName: string
  ): Promise<GoidiniInstall> {
    const newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      Apikey: apikey,
      'x-vtex-api-appKey': appKey,
      'x-vtex-api-appToken': appToken,
    }

    return this.http.post(
      routes.getGoidiniInstallData(),
      { list_id: listId, store_url: storeUrl, store_name: storeName },
      newOptions
    )
  }
}

export default GoidiniInstallClient
