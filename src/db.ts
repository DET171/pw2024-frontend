import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import type { DB } from 'kysely-codegen';

const dialect = new PostgresDialect({
	pool: new pg.Pool({
		connectionString: import.meta.env.DATABASE_URL,
	}),
});

export const db = new Kysely<DB>({
	dialect,
});