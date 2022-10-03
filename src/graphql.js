export const CreateDataPoint = /* GraphQL */ `
  mutation CreateDataPoint($input: CreateDataPointInput!) {
    createDataPoint(input: $input) {
      createdAt
      name
      value
    }
  }
`

export const QueryDataPoints = /* GraphQL */ `
  query list(
    $name: ID!
    $createdAt: ModelStringKeyConditionInput
    $limit: Int
    $sortDirection: ModelSortDirection
    $nextToken: String
  ) {
    queryDataPointsByNameAndDateTime(
      name: $name
      createdAt: $createdAt
      limit: $limit
      sortDirection: $sortDirection
      nextToken: $nextToken
    ) {
      items {
        createdAt
        name
        value
      }
      nextToken
    }
  }
`

export const OnCreateDataPoint = /* GraphQL */ `
  subscription OnCreateDataPoint($name: ID!) {
    onCreateDataPoint(name: $name) {
      createdAt
      name
      value
    }
  }
`
