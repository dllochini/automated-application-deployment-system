import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  repo_url: varchar("repo_url", { length: 1024 }).notNull(),
  framework: varchar("framework", { length: 64 }).notNull(),
  database: varchar("database", { length: 64 }).notNull(),
  // port: integer('port').notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  container_id: varchar("container_id", { length: 256 }),
  public_url: varchar("public_url", { length: 512 }),
  env: json("env"),
  created_at: timestamp("created_at").defaultNow(),
});

// export const ports = pgTable('ports', {
//   port_number: integer('port_number').primaryKey(),
//   is_used: boolean('is_used').notNull().default(false),
// });
