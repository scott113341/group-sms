import { Client } from "pg";
import * as z from "zod";

async function withPgClient<T>(
  callback: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  try {
    const result = await callback(client);
    await client.end();
    return result;
  } catch (e) {
    await client.end();
    throw e;
  }
}

// Runs a query and validates the returned rows against a schema, so callers get rows of a checked type.
export async function queryRows<S extends z.ZodType>(
  client: Client,
  schema: S,
  text: string,
  values?: unknown[],
): Promise<z.output<S>[]> {
  const result = await client.query(text, values);
  return z.array(schema).parse(result.rows);
}

export default withPgClient;
