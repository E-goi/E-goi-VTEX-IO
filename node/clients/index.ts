import { IOClients } from '@vtex/api'

import MyAccount from './myAccount'
import GetLists from './getLists'
import Stores from './stores'
import CreateConnectedSites from './connectedSites'
import GetEgoiFields from './getEgoiFields'
import getVtexClientFields from './getVtexClientFields'
import GoidiniSync from './goidiniSync'
import GoidiniOrderMapSync from './goidiniOrderMapSync'
import GoidiniOrderBulkSync from './goidiniOrderSyncBulk'
import GoidiniInstall from './goidiniInstall'
import GetDataEntities from './getDataEntities'
import Identity from '../utils/Identity'
import GetGoidiniMapFields from './getGoidiniMapFields'
import GetGoidiniOrderMapFields from './getGoidiniOrderMapFields'
import GetGoidiniEgoiOrderStatus from './getGoidiniEgoiOrderStatus'
import GoidiniSettings from './goidiniSettings'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get myAccount() {
    return this.getOrSet('myAccount', MyAccount)
  }

  public get getLists() {
    return this.getOrSet('getLists', GetLists)
  }

  public get stores() {
    return this.getOrSet('stores', Stores)
  }

  public get createConnectedSites() {
    return this.getOrSet('createConnectedSites', CreateConnectedSites)
  }

  public get getEgoiFields() {
    return this.getOrSet('getEgoiFields', GetEgoiFields)
  }

  public get getVtexClientFields() {
    return this.getOrSet('getVtexClientFields', getVtexClientFields)
  }

  public get goidiniSync() {
    return this.getOrSet('goidiniSync', GoidiniSync)
  }

  public get goidiniOrderMapSync() {
    return this.getOrSet('goidiniOrderMapSync', GoidiniOrderMapSync)
  }

  public get goidiniOrderBulkSync() {
    return this.getOrSet('goidiniOrderBulkSync', GoidiniOrderBulkSync)
  }

  public get goidiniInstall() {
    return this.getOrSet('goidiniInstall', GoidiniInstall)
  }

  public get identity() {
    return this.getOrSet('identity', Identity)
  }

  public get getDataEntities() {
    return this.getOrSet('getDataEntities', GetDataEntities)
  }

  public get getGoidiniMapFields() {
    return this.getOrSet('getGoidiniMapFields', GetGoidiniMapFields)
  }

  public get getGoidiniOrderMapFields() {
    return this.getOrSet('getGoidiniOrderMapFields', GetGoidiniOrderMapFields)
  }

  public get getGoidiniEgoiOrderStatus() {
    return this.getOrSet('getGoidiniEgoiOrderStatus', GetGoidiniEgoiOrderStatus)
  }


  public get goidiniSettings() {
    return this.getOrSet('goidiniSettings', GoidiniSettings)
  }

}
