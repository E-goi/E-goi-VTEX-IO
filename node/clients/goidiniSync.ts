import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GoidiniSync } from '../typings/goidiniSync'

const routes = {
  getGoidiniSyncData: () =>
    `https://goidini.e-goi.com/vtex-io/sync`, //CHANGE DEV TO PROD
}

class GoidiniSyncClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async saveGoidiniSync(apikey: string, appKey: string, appToken: string, vtex: string[], egoi: string[]): Promise<GoidiniSync> {

    let newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'Apikey': apikey,
      'x-vtex-api-appKey': appKey,
      'x-vtex-api-appToken': appToken
    }

    return this.http.post(routes.getGoidiniSyncData(), { 'vtex': vtex, 'egoi': egoi }, newOptions)
  }
}

export default GoidiniSyncClient
