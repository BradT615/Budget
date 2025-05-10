// src/types/next.ts
// Helper types for Next.js 15 dynamic routes and request API parameters

/**
 * Type for page route parameters
 * In Next.js 15+, params are a Promise
 */
export type RouteParams<T = Record<string, string>> = Promise<T>;

/**
 * Type for search parameters
 * In Next.js 15+, searchParams are a Promise
 */
export type SearchParams = Promise<{ 
  [key: string]: string | string[] | undefined 
} | undefined>;

/**
 * Type for page props with route parameters
 */
export type PagePropsWithParams<T = Record<string, string>> = {
  params: RouteParams<T>;
};

/**
 * Type for page props with search parameters
 */
export type PagePropsWithSearchParams = {
  searchParams: SearchParams;
};

/**
 * Type for page props with both route and search parameters
 */
export type PageProps<T = Record<string, string>> = {
  params: RouteParams<T>;
  searchParams: SearchParams;
};

// Usage examples:
// For a page with only route params: function Page({ params }: PagePropsWithParams<{ slug: string }>)
// For a page with only search params: function Page({ searchParams }: PagePropsWithSearchParams)
// For a page with both: function Page({ params, searchParams }: PageProps<{ slug: string }>)