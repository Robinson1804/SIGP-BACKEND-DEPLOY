import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

/**
 * Apply pagination to a TypeORM query builder
 */
export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: PaginationOptions = {},
): Promise<PaginatedResponse<T>> {
  const page = Math.max(1, options.page || 1);
  const maxLimit = options.maxLimit || 100;
  const limit = Math.min(Math.max(1, options.limit || 20), maxLimit);
  const skip = (page - 1) * limit;

  // Execute count and data queries
  const [data, total] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Create pagination response from array
 */
export function paginateArray<T>(
  items: T[],
  options: PaginationOptions = {},
): PaginatedResponse<T> {
  const page = Math.max(1, options.page || 1);
  const maxLimit = options.maxLimit || 100;
  const limit = Math.min(Math.max(1, options.limit || 20), maxLimit);
  const skip = (page - 1) * limit;

  const total = items.length;
  const data = items.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
