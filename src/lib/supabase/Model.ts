import { supabase } from './client';

interface SelectParams {
  conditions?: [string, string][];
  columns?: string[];
  order?: [string, { ascending?: boolean }?];
}

class Model<T> {
  table: string;
  supabase: typeof supabase;

  constructor(table: string) {
    this.table = table;
    this.supabase = supabase;
  }

  async select({ conditions = [], columns = ['*'], order }: SelectParams) {
    const query = this.supabase.from(this.table).select(...columns);

    conditions.forEach(([column, value]) => {
      query.eq(column, value);
    });

    if (order) {
      query.order(...order);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error[${error.code}]: ${error.message}`);
    }
    return { data: data as T[] | null, error };
  }

  async insert(insertData: Record<string, unknown> | Record<string, unknown>[]) {
    const { data, error } = await this.supabase.from(this.table).insert(insertData);

    if (error) {
      console.error(`Error[${error.code}]: ${error.message}`);
    }
    return { data, error };
  }

  async update(updateData: Record<string, unknown>, conditions: [string, string][]) {
    const query = this.supabase.from(this.table).update(updateData);

    conditions.forEach(([column, value]) => {
      query.eq(column, value);
    });

    const { data, error } = await query;

    if (error) {
      console.error(`Error[${error.code}]: ${error.message}`);
    }
    return { data, error };
  }
}

export default Model;
