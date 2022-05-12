export interface GetLists {
  total_items: Int
  items: Items[]
}

export interface Items {
  list_id: Int
  internal_name: String
  public_name: String
  status: String
  group_id: Int
  created: String
  updated: String
}