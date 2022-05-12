export interface MyAccount {
  general_info: GeneralInfo!
  billing_info: BillingInfo!
  plan_info: PlanInfo!
  balance_info: BalanceInfo!
  module_info: ModuleInfo!
}

export interface GeneralInfo {
  name: String!
  website: String!
  cellphone: String!
  company_size: Int!
  bussiness_sector: BussinessSector!
  client_id: String!
}

export interface BussinessSector {
  business_sector_id: Int
  name: String
}

export interface BillingInfo {
  type: String
  company_legal_name: String
  vat_number: Int
  country: CountryCode
  city: String
  state: String
  address1: String
  address2: String
  zip_code: String
  invoice_comments: String
}

export interface CountryCode {
  country_code: String
}

export interface PlanInfo {
  type: String
}

export interface BalanceInfo {
  balance: String
  currency: String
}

export interface ModuleInfo {
  te: Te
}

export interface Te {
  enabled: Boolean
}
