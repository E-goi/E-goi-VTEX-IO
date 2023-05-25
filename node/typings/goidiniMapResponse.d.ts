  export interface GoidiniMap {
    vtexField: string;
    egoiField: string;
    entity: string;
  }
  
  export interface GoidiniMapResponse {
    response: string;
    status: number;
    message: GoidiniMap[];
    error: string | null;
  }