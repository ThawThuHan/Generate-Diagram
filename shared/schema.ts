import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const projects = pgTable("projects", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const diagrams = pgTable("diagrams", {
  id: integer("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  diagramType: text("diagram_type").notNull(),
  format: text("format").notNull(),
  code: text("code").notNull(),
  imageData: text("image_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDiagramSchema = createInsertSchema(diagrams).omit({
  id: true,
  createdAt: true,
});

export type InsertDiagram = z.infer<typeof insertDiagramSchema>;
export type Diagram = typeof diagrams.$inferSelect;
