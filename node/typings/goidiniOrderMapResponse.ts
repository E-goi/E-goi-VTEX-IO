export interface MappingField {
  appStatus: string
  egoiStatus: string
}

export interface GoidiniOrderMap {
  order_type: string
  mapping: MappingField[]
}
