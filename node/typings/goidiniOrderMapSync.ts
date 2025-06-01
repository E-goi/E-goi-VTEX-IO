export interface StatusPairInput {
  appStatus: string
  egoiStatus: string
}

export interface OrderMappingInput {
  order_type: 'fulfillment' | 'marketplace'
  mapping: StatusPairInput[]
}

export interface GoidiniOrderMapSyncInput {
  payload: OrderMappingInput[]
}

export interface OrderMappingRecord {
  order_type: 'fulfillment' | 'marketplace'
  mapping: Record<string, string>
}

export interface GoidiniOrderMapSyncBody {
  payload: OrderMappingRecord[]
}

export interface GoidiniOrderMapSyncResponse {
  status: number
  message: string
  response: any
}
