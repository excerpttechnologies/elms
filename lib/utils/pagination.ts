export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
}

export function getPagination(options: PaginationOptions): PaginationResult {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(options.limit || 10, 100);
  
  const skip = (page - 1) * limit;
  
  const sort: Record<string, 1 | -1> = {};
  if (options.sortBy) {
    sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
  } else {
    sort['createdAt'] = -1;
  }

  return { skip, limit, sort };
}

export function extractPaginationParams(searchParams: URLSearchParams): PaginationOptions {
  return {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}
