import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ['admin', 'supervisor', 'user', 'operator'] }).default('user'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work permits table
export const permits = pgTable("permits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  permitNumber: varchar("permit_number").unique().notNull(),
  type: varchar("type", { enum: ['excavation', 'hot', 'cold'] }).notNull(),
  status: varchar("status", { enum: ['draft', 'pending_validation', 'pending_approval', 'approved', 'rejected', 'expired'] }).default('draft'),
  
  // Basic information
  executorCompany: text("executor_company"),
  stationDuct: text("station_duct"),
  areaSite: text("area_site"),
  workOrderNumber: text("work_order_number"),
  workDescription: text("work_description"),
  workDate: timestamp("work_date"),
  validFrom: text("valid_from"), // time as string HH:MM
  validTo: text("valid_to"), // time as string HH:MM
  
  // Checklist responses (JSON object with question IDs and responses)
  checklistResponses: jsonb("checklist_responses"),
  
  // PPE requirements (array of strings)
  ppeRequirements: jsonb("ppe_requirements"),
  
  // APT analysis data
  aptAnalysis: jsonb("apt_analysis"),
  
  // Photos (array of photo URLs)
  photos: jsonb("photos"),
  
  // Special instructions
  specialInstructions: text("special_instructions"),
  
  // Gas detection readings
  gasDetectionReading: text("gas_detection_reading"),
  gasDetectionDate: timestamp("gas_detection_date"),
  
  // Personnel
  createdBy: varchar("created_by").references(() => users.id),
  validatedBy: varchar("validated_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  
  // Comments
  validationComments: text("validation_comments"),
  approvalComments: text("approval_comments"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permit workflow history
export const permitHistory = pgTable("permit_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  permitId: varchar("permit_id").references(() => permits.id),
  action: varchar("action").notNull(), // created, validated, approved, rejected, etc.
  performedBy: varchar("performed_by").references(() => users.id),
  comments: text("comments"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertPermit = typeof permits.$inferInsert;
export type Permit = typeof permits.$inferSelect;

export type InsertPermitHistory = typeof permitHistory.$inferInsert;
export type PermitHistory = typeof permitHistory.$inferSelect;

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPermitSchema = createInsertSchema(permits).omit({
  id: true,
  permitNumber: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Make type required for creation
  type: z.enum(['excavation', 'hot', 'cold']),
  // Convert string date to Date object
  workDate: z.string().transform((val) => new Date(val)),
});
export const insertPermitHistorySchema = createInsertSchema(permitHistory).omit({
  id: true,
  timestamp: true,
});

// Validation schemas
export const permitBasicInfoSchema = z.object({
  executorCompany: z.string().min(1, "Empresa/ejecutor requerido"),
  stationDuct: z.string().min(1, "Estación/ducto requerido"),
  areaSite: z.string().min(1, "Área/sitio requerido"),
  workOrderNumber: z.string().min(1, "Número de orden requerido"),
  workDescription: z.string().min(1, "Descripción del trabajo requerida"),
  workDate: z.date(),
  validFrom: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
  validTo: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
});
