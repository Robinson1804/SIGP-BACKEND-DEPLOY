import { SelectQueryBuilder, Brackets, ObjectLiteral } from 'typeorm';

/**
 * Sort direction
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Sort option
 */
export interface SortOption {
  field: string;
  direction: SortDirection;
}

/**
 * Filter operator
 */
export type FilterOperator =
  | 'eq'       // Equal
  | 'ne'       // Not equal
  | 'gt'       // Greater than
  | 'gte'      // Greater than or equal
  | 'lt'       // Less than
  | 'lte'      // Less than or equal
  | 'like'     // LIKE (case sensitive)
  | 'ilike'    // ILIKE (case insensitive)
  | 'in'       // IN array
  | 'nin'      // NOT IN array
  | 'null'     // IS NULL
  | 'notnull'  // IS NOT NULL
  | 'between'; // BETWEEN

/**
 * Filter condition
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: any;
}

/**
 * Apply filters to a query builder
 */
export function applyFilters<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  filters: FilterCondition[],
): SelectQueryBuilder<T> {
  let paramIndex = 0;

  for (const filter of filters) {
    const column = `${alias}.${filter.field}`;
    const paramName = `filter_${paramIndex++}`;

    switch (filter.operator) {
      case 'eq':
        queryBuilder.andWhere(`${column} = :${paramName}`, {
          [paramName]: filter.value,
        });
        break;

      case 'ne':
        queryBuilder.andWhere(`${column} != :${paramName}`, {
          [paramName]: filter.value,
        });
        break;

      case 'gt':
        queryBuilder.andWhere(`${column} > :${paramName}`, {
          [paramName]: filter.value,
        });
        break;

      case 'gte':
        queryBuilder.andWhere(`${column} >= :${paramName}`, {
          [paramName]: filter.value,
        });
        break;

      case 'lt':
        queryBuilder.andWhere(`${column} < :${paramName}`, {
          [paramName]: filter.value,
        });
        break;

      case 'lte':
        queryBuilder.andWhere(`${column} <= :${paramName}`, {
          [paramName]: filter.value,
        });
        break;

      case 'like':
        queryBuilder.andWhere(`${column} LIKE :${paramName}`, {
          [paramName]: `%${filter.value}%`,
        });
        break;

      case 'ilike':
        queryBuilder.andWhere(`${column} ILIKE :${paramName}`, {
          [paramName]: `%${filter.value}%`,
        });
        break;

      case 'in':
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          queryBuilder.andWhere(`${column} IN (:...${paramName})`, {
            [paramName]: filter.value,
          });
        }
        break;

      case 'nin':
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          queryBuilder.andWhere(`${column} NOT IN (:...${paramName})`, {
            [paramName]: filter.value,
          });
        }
        break;

      case 'null':
        queryBuilder.andWhere(`${column} IS NULL`);
        break;

      case 'notnull':
        queryBuilder.andWhere(`${column} IS NOT NULL`);
        break;

      case 'between':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          queryBuilder.andWhere(
            `${column} BETWEEN :${paramName}_start AND :${paramName}_end`,
            {
              [`${paramName}_start`]: filter.value[0],
              [`${paramName}_end`]: filter.value[1],
            },
          );
        }
        break;
    }
  }

  return queryBuilder;
}

/**
 * Apply sorting to a query builder
 */
export function applySorting<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  sortOptions: SortOption[],
  allowedFields?: string[],
): SelectQueryBuilder<T> {
  for (const sort of sortOptions) {
    // Validate field if allowed fields are specified
    if (allowedFields && !allowedFields.includes(sort.field)) {
      continue;
    }

    const column = sort.field.includes('.') ? sort.field : `${alias}.${sort.field}`;
    const direction = sort.direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder.addOrderBy(column, direction);
  }

  return queryBuilder;
}

/**
 * Apply full-text search (PostgreSQL)
 */
export function applyFullTextSearch<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  searchTerm: string,
  searchFields: string[],
  language: string = 'spanish',
): SelectQueryBuilder<T> {
  if (!searchTerm || searchFields.length === 0) {
    return queryBuilder;
  }

  // Build tsvector expression
  const tsVectorParts = searchFields.map(
    (field) => `COALESCE(${alias}.${field}, '')`,
  );
  const tsVector = `to_tsvector('${language}', ${tsVectorParts.join(" || ' ' || ")})`;

  // Build tsquery
  const tsQuery = `plainto_tsquery('${language}', :searchTerm)`;

  queryBuilder.andWhere(`${tsVector} @@ ${tsQuery}`, { searchTerm });

  return queryBuilder;
}

/**
 * Apply date range filter
 */
export function applyDateRange<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  dateField: string,
  startDate?: Date | string,
  endDate?: Date | string,
): SelectQueryBuilder<T> {
  const column = `${alias}.${dateField}`;

  if (startDate) {
    queryBuilder.andWhere(`${column} >= :startDate`, { startDate });
  }

  if (endDate) {
    queryBuilder.andWhere(`${column} <= :endDate`, { endDate });
  }

  return queryBuilder;
}

/**
 * Apply OR conditions
 */
export function applyOrConditions<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  conditions: Array<{ field: string; value: any }>,
): SelectQueryBuilder<T> {
  if (conditions.length === 0) {
    return queryBuilder;
  }

  queryBuilder.andWhere(
    new Brackets((qb) => {
      conditions.forEach((condition, index) => {
        const paramName = `or_param_${index}`;
        const column = `${alias}.${condition.field}`;

        if (index === 0) {
          qb.where(`${column} = :${paramName}`, { [paramName]: condition.value });
        } else {
          qb.orWhere(`${column} = :${paramName}`, { [paramName]: condition.value });
        }
      });
    }),
  );

  return queryBuilder;
}
