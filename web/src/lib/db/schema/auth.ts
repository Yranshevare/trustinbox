import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const user = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  isVerified: integer("isVerified").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("userId").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull(),
});

export const otp = sqliteTable("otp", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("userId").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
});

export interface predictions {
  error: boolean;
  prediction: "bad" | "good";
  raw: {
    good: number;
    bad: number;
  };
  status: string;
}

export const predictions = sqliteTable("predictions", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("userId").notNull(),
  metadata: text("metadata").notNull(),
  sender: text("sender"),
  emailSubject: text("emailSubject"),
  body: text("body"),
  attachments: text("attachments"),
});

export type User = typeof user.$inferSelect;
