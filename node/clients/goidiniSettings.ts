import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { GoidiniSettingsResponse } from '../typings/goidiniSettings'

const routes = {
  goidniSettingsData: () => `https://dev-goidini.e-goi.com/vtex-i-o/settings`, // CHANGE DEV TO PROD
}

class goidiniSettingsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async goidiniSettings(
    apikey: string,
    appKey: string,
    appToken: string,
    domain: string
  ): Promise<GoidiniSettingsResponse> {
    const newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      Apikey: apikey
    }

    newOptions.params = {
        'store': domain,
        'vtexAppKey': appKey,
        'vtexAppToken': appToken
    }

    return this.http.get(
      routes.goidniSettingsData(),
      newOptions
    )
  }
}

export default goidiniSettingsClient
