import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { EgoiFields } from '../typings/egoiFields'

const routes = {
  getEgoiFieldsData: (listId: number) =>
    `https://api.egoiapp.com/lists/${listId}/fields`,
}

class GetEgoiFieldsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getEgoiFieds(
    apikey: string,
    listId: number
  ): Promise<EgoiFields> {
    const newOptions = { ...(this.options as InstanceOptions) }

    newOptions.headers = {
      'Content-Type': 'application/json',
      'X-Vtex-Use-Https': 'true',
      Apikey: apikey,
    }
    const response = await this.http.get(
      routes.getEgoiFieldsData(listId),
      newOptions
    )

    const filteredFields = response.filter(
      (field: EgoiFields) => field.format !== 'options'
    )

    return filteredFields
  }
}

export default GetEgoiFieldsClient
