import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL;

export const sql = dbUrl ? neon(dbUrl) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

export * from "./schema";
