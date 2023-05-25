export interface GoidiniSync {
  vtex: String[]
  egoi: String[]
  masterData: MasterDataObject[]
}

export interface MasterDataObject {
  entity: String
  vtexField: String
  egoiField: String
}