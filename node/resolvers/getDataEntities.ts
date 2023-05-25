import type { ServiceContext } from '@vtex/api'

import type { DataEntities } from '../typings/dataEntities'
import type { Clients } from '../clients'

export async function getDataEntities(
    _: unknown,
    __: unknown,
    context: ServiceContext<Clients>
    ): Promise<DataEntities[]> {
    const {
        clients: { getDataEntities, stores },
    } = context
    
    const appId = process.env.VTEX_APP_ID
    
    const response = await stores.getStores()

    const [store, ,] = response
    const { name } = store

    if (!appId) {
        throw new Error('No appId defined')
    }
    
    try {
        return getDataEntities.getDataEntities(name)
    } catch (error) {
        throw new Error(error.message)
    }
    }