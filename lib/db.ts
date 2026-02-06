import { Database } from "bun:sqlite";
import { migrate } from "./migrate";

const db = new Database("database.sqlite");
db.run("PRAGMA journal_mode = WAL;");

migrate(db);

export { db };
