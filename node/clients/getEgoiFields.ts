import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { EgoiFields } from '../typings/egoiFields'

const routes = {
  getEgoiFieldsData: (listId: Number) =>
    `https://api.egoiapp.com/lists/` + listId + `/fields`,
}

class GetEgoiFieldsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getEgoiFieds(apikey: string, listId: Number): Promise<EgoiFields> {

    let newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'X-Vtex-Use-Https': 'true',
      'Apikey': apikey
    }

    return this.http.get(routes.getEgoiFieldsData(listId), newOptions)
  }
}

export default GetEgoiFieldsClient
