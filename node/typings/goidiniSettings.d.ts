export interface GoidiniSettings {
    vtexAppKey: string;
    vtexAppToken: string;
    listId: number;
  }
  
  export interface GoidiniSettingsResponse {
    response: string;
    status: number;
    message: GoidiniSettings;
    error: string | null;
  }