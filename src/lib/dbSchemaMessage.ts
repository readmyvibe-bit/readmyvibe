export const REQUIRED_SCHEMA_SQL = `alter table generations add column if not exists full_result text;
alter table payments add column if not exists generation_id uuid;`;

export function mapSchemaError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (
    raw.includes("full_result") ||
    raw.includes("generation_id") ||
    raw.includes("schema cache") ||
    raw.includes("Could not find the")
  ) {
    return `Database schema needs a one-time update. Run this SQL in Supabase:\n${REQUIRED_SCHEMA_SQL}`;
  }
  return raw;
}
