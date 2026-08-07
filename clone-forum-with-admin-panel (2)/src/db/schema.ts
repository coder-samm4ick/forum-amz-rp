import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 16 }).notNull().default("member"),
  color: varchar("color", { length: 16 }).notNull().default("#f97316"),
  bio: text("bio").notNull().default(""),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: varchar("token", { length: 64 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  icon: varchar("icon", { length: 32 }).notNull().default("folder"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 140 }).notNull(),
  pinned: boolean("pinned").notNull().default(false),
  closed: boolean("closed").notNull().default(false),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gameServer = pgTable("game_server", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull().default("Чёрный"),
  address: varchar("address", { length: 128 }).notNull().default("black.phantom-rp.ru:7777"),
  online: boolean("online").notNull().default(true),
  players: integer("players").notNull().default(0),
  maxPlayers: integer("max_players").notNull().default(500),
  motd: text("motd").notNull().default(""),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  restarts: integer("restarts").notNull().default(0),
});
