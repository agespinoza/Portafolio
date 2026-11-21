// Runs a DuckDB SQL file from the daily-data-lab folder. Usage: node scripts/day-004/run-sql.mjs <file.sql>
import { readFileSync } from "node:fs";
import { DuckDBInstance } from "@duckdb/node-api";

const file = process.argv[2];
const db = await DuckDBInstance.create(":memory:");
const con = await db.connect();
const statements = await con.extractStatements(readFileSync(file, "utf8"));
for (let i = 0; i < statements.count; i++) await (await statements.prepare(i)).run();
console.log(`✓ ${file} (${statements.count} statements)`);
