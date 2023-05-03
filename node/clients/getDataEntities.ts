
 import {
    InstanceOptions,
    IOContext,
    JanusClient,
  } from '@vtex/api'

import type { DataEntities } from '../typings/dataEntities'

const routes = {
    getDataEntitiesData: (name: string) =>
      `https://api.vtex.com/${name}/dataentities`,
  }


    class GetDataEntities extends JanusClient {
    constructor(context: IOContext, options?: InstanceOptions) {
        super( context,{
        ...options,
        headers: {
            ...options?.headers,
            ...{Accept: 'application/vnd.vtex.ds.v10+json', 'Content-Type': 'application/json'},
            ...(context.adminUserAuthToken
                ? { VtexIdclientAutCookie: context.adminUserAuthToken }
                : null),
              ...(context.storeUserAuthToken
                ? { VtexIdclientAutCookie: context.storeUserAuthToken }
                : null),
        },})
    }


    
    public async getDataEntities(name: string): Promise<DataEntities[]> { 
        return this.http.get(routes.getDataEntitiesData(name), this.options)
      }
}

export default GetDataEntities
