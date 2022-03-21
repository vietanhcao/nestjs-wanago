export const CONST = {
  /* Thông tin cấu hình client query */
  LIMIT_DEFAULT: 20,
  OFFSET_DEFAULT: 0,
  QUERY_CONFIG: [
    { key: 'desc', value: -1 },
    { key: 'asc', value: 1 },
    { key: 'in', value: '$in' },
    { key: 'eq', value: '$eq' },
    { key: 'gte', value: '$gte' },
    { key: 'lte', value: '$lte' },
    { key: 'gt', value: '$gt' },
    { key: 'lt', value: '$lt' },
    { key: 'or', value: '$or' },
    { key: 'ne', value: '$ne' },
    { key: 'contains', value: '$regex' },
  ],
};
