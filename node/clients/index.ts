import { IOClients } from '@vtex/api'

import MyAccount from './myAccount'
import GetLists from './getLists'
import Stores from './stores'
import CreateConnectedSites from './connectedSites'
import GetEgoiFields from './getEgoiFields'
import getVtexClientFields from './getVtexClientFields'
import GoidiniSync from './goidiniSync'
import GoidiniInstall from './goidiniInstall'

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

  public get goidiniInstall() {
    return this.getOrSet('goidiniInstall', GoidiniInstall)
  }
}