// ------------------------------------------------------------------
// =============> Tipos para o GraphQL resolver (input)
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// =============> Tipos para o client HTTP (body)
// ------------------------------------------------------------------

/**
 * Este é o formato que a API externa realmente espera:
 * { order_type: string; mapping: Record<string,string> }
 */
export interface OrderMappingRecord {
  order_type: 'fulfillment' | 'marketplace'
  mapping: Record<string, string>
}

export interface GoidiniOrderMapSyncBody {
  payload: OrderMappingRecord[]
}

// pode permanecer qualquer
export interface GoidiniOrderMapSyncResponse {
  status: number
  message: string
  response: any
}
