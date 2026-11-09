import { mockStore } from "../mocks/mock-store";

export interface MockUserAuth {
  id: string;
  email: string;
  aud: string;
  role: string;
  created_at: string;
  user_metadata: {
    full_name: string;
  };
}

export interface MockSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: MockUserAuth;
}

export class MockQueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: any; count?: number | null }> {
  private tableName: string;
  private selectedColumns: string = "*";
  private filters: Array<(row: any) => boolean> = [];
  private orderField?: string;
  private ascending: boolean = true;
  private limitCount?: number;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private insertData?: any;
  private updateData?: any;
  private isDelete: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*"): this {
    this.selectedColumns = columns;
    return this;
  }

  insert(values: any): this {
    this.insertData = values;
    return this;
  }

  update(values: any): this {
    this.updateData = values;
    return this;
  }

  delete(): this {
    this.isDelete = true;
    return this;
  }

  eq(column: string, value: any): this {
    this.filters.push((row) => {
      // support snake_case and camelCase
      const camel = column.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
      return row[column] === value || row[camel] === value;
    });
    return this;
  }

  neq(column: string, value: any): this {
    this.filters.push((row) => {
      const camel = column.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
      return row[column] !== value && row[camel] !== value;
    });
    return this;
  }

  in(column: string, values: any[]): this {
    this.filters.push((row) => {
      const camel = column.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
      const val = row[column] !== undefined ? row[column] : row[camel];
      return values.includes(val);
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.orderField = column;
    this.ascending = options?.ascending !== false;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  single(): this {
    this.isSingle = true;
    return this;
  }

  maybeSingle(): this {
    this.isMaybeSingle = true;
    return this;
  }

  private resolveData(): { data: any; error: any; count: number | null } {
    try {
      let rawRows: any[] = [];

      switch (this.tableName) {
        case "brands":
          rawRows = mockStore.getBrands();
          break;
        case "products":
          rawRows = mockStore.getProducts();
          break;
        case "profiles":
          rawRows = mockStore.getProfiles();
          break;
        case "measurements":
          const profile = mockStore.getProfile();
          if (profile) {
            rawRows = [mockStore.getMeasurements(profile.id)];
          }
          break;
        case "fit_preferences":
        case "preferences":
          const prof = mockStore.getProfile();
          if (prof) {
            rawRows = mockStore.getPreferences(prof.id);
          }
          break;
        case "reference_garments":
          const p = mockStore.getProfile();
          if (p) {
            rawRows = mockStore.getReferenceGarments(p.id);
          }
          break;
        default:
          rawRows = [];
      }

      // Handle insert
      if (this.insertData) {
        const rowsToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
        return { data: this.isSingle ? rowsToInsert[0] : rowsToInsert, error: null, count: rowsToInsert.length };
      }

      // Handle update
      if (this.updateData) {
        return { data: this.updateData, error: null, count: 1 };
      }

      // Handle delete
      if (this.isDelete) {
        return { data: null, error: null, count: 0 };
      }

      // Apply filters
      let result = rawRows.filter((row) => this.filters.every((f) => f(row)));

      // Order
      if (this.orderField) {
        const col = this.orderField;
        const camel = col.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
        result.sort((a, b) => {
          const valA = a[col] ?? a[camel] ?? 0;
          const valB = b[col] ?? b[camel] ?? 0;
          if (valA < valB) return this.ascending ? -1 : 1;
          if (valA > valB) return this.ascending ? 1 : -1;
          return 0;
        });
      }

      // Limit
      if (typeof this.limitCount === "number") {
        result = result.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        if (result.length === 0) {
          return { data: null, error: { message: "Row not found", code: "PGRST116" }, count: 0 };
        }
        return { data: result[0], error: null, count: 1 };
      }

      if (this.isMaybeSingle) {
        return { data: result[0] || null, error: null, count: result.length };
      }

      return { data: result, error: null, count: result.length };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || "Database error" }, count: null };
    }
  }

  then<TResult1 = { data: T | null; error: any; count?: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result = this.resolveData();
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

export class MockSupabaseClient {
  public auth = {
    getUser: async (): Promise<{ data: { user: MockUserAuth | null }; error: any }> => {
      const user = mockStore.getUser();
      return {
        data: {
          user: {
            id: user.id,
            email: user.email,
            aud: "authenticated",
            role: "authenticated",
            created_at: user.createdAt,
            user_metadata: {
              full_name: user.fullName,
            },
          },
        },
        error: null,
      };
    },

    getSession: async (): Promise<{ data: { session: MockSession | null }; error: any }> => {
      const userRes = await this.auth.getUser();
      if (!userRes.data.user) {
        return { data: { session: null }, error: null };
      }
      return {
        data: {
          session: {
            access_token: "mock-jwt-token-wearid",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh-token",
            user: userRes.data.user,
          },
        },
        error: null,
      };
    },

    signInWithPassword: async (credentials: { email?: string; password?: string }) => {
      const user = mockStore.getUser();
      const mockUser: MockUserAuth = {
        id: user.id,
        email: credentials.email || user.email,
        aud: "authenticated",
        role: "authenticated",
        created_at: user.createdAt,
        user_metadata: { full_name: user.fullName },
      };
      return {
        data: {
          user: mockUser,
          session: {
            access_token: "mock-jwt-token-wearid",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh-token",
            user: mockUser,
          },
        },
        error: null,
      };
    },

    signUp: async (credentials: { email?: string; password?: string }) => {
      return this.auth.signInWithPassword(credentials);
    },

    signOut: async () => {
      return { error: null };
    },

    onAuthStateChange: (_callback: (event: string, session: MockSession | null) => void) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  };

  from(tableName: string): MockQueryBuilder {
    return new MockQueryBuilder(tableName);
  }
}

export function createMockSupabaseClient(): MockSupabaseClient {
  return new MockSupabaseClient();
}
