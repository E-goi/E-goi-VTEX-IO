import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

export interface AutomationSystem {
  paused: boolean
  type: string
  domain?: string
  url?: string
  title?: string
}

export interface AutomationsResponse {
  items: AutomationSystem[]
}

const routes = {
  getAutomations: () => `https://api.egoiapp.com/automations/system`,
}

class AutomationsClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, options)
  }

  public async getAutomations(apikey: string): Promise<AutomationsResponse> {
    const newOptions = {
      ...(this.options as InstanceOptions),
      headers: {
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
        Apikey: apikey,
      },
    }

    return this.http.get(routes.getAutomations(), newOptions)
  }

  public async saveAutomation(
    apikey: string,
    data: AutomationSystem
  ): Promise<any> {
    const newOptions = {
      ...(this.options as InstanceOptions),
      headers: {
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
        Apikey: apikey,
      },
    }

    return this.http.post(routes.getAutomations(), data, newOptions)
  }
}

export default AutomationsClient
