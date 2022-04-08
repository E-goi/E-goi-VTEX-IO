import type { InstanceOptions, IOContext } from '@vtex/api'
import { LicenseManager } from '@vtex/api'

import type { GetStores } from '../typings/getStores'

class Stores extends LicenseManager {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        VtexIdClientAutCookie: context.adminUserAuthToken ?? '',
      },
    })
  }

  public getStores(): Promise<GetStores[]> {
    return this.http.get('/api/vlm/account/stores')
  }
}

export default Stores
