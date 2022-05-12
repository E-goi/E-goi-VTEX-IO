
export interface VtexClient {
  acronym: String
  name: String
  primaryKeyType: String
  allowGetAll: Boolean
  fields: VtexClientFields[]
}

export interface VtexClientFields {
  name: String
  type: String
  displayName: String
  isNullable: String
  isSearchable: String
  isFilter: String
  isInternal: String
}
