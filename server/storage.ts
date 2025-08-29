import {
  users,
  permits,
  permitHistory,
  type User,
  type UpsertUser,
  type Permit,
  type InsertPermit,
  type PermitHistory,
  type InsertPermitHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Permit operations
  createPermit(permit: InsertPermit): Promise<Permit>;
  getPermit(id: string): Promise<Permit | undefined>;
  getPermits(filters?: {
    status?: string;
    type?: string;
    createdBy?: string;
    validatedBy?: string;
    approvedBy?: string;
  }): Promise<Permit[]>;
  updatePermit(id: string, updates: Partial<Permit>): Promise<Permit>;
  generatePermitNumber(): Promise<string>;
  
  // Permit history
  addPermitHistory(history: InsertPermitHistory): Promise<PermitHistory>;
  getPermitHistory(permitId: string): Promise<PermitHistory[]>;
  
  // Dashboard statistics
  getDashboardStats(userId?: string): Promise<{
    activePermits: number;
    pendingPermits: number;
    approvedToday: number;
    expiringToday: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Permit operations
  async createPermit(permitData: InsertPermit): Promise<Permit> {
    const permitNumber = await this.generatePermitNumber();
    const [permit] = await db
      .insert(permits)
      .values({
        ...permitData,
        permitNumber,
      })
      .returning();
    
    // Add creation history
    await this.addPermitHistory({
      permitId: permit.id,
      action: 'created',
      performedBy: permit.createdBy!,
      comments: 'Permiso creado',
    });
    
    return permit;
  }

  async getPermit(id: string): Promise<Permit | undefined> {
    const [permit] = await db.select().from(permits).where(eq(permits.id, id));
    return permit;
  }

  async getPermits(filters: {
    status?: string;
    type?: string;
    createdBy?: string;
    validatedBy?: string;
    approvedBy?: string;
  } = {}): Promise<Permit[]> {
    const conditions = [];
    if (filters.status) conditions.push(eq(permits.status, filters.status as any));
    if (filters.type) conditions.push(eq(permits.type, filters.type as any));
    if (filters.createdBy) conditions.push(eq(permits.createdBy, filters.createdBy));
    if (filters.validatedBy) conditions.push(eq(permits.validatedBy, filters.validatedBy));
    if (filters.approvedBy) conditions.push(eq(permits.approvedBy, filters.approvedBy));
    
    let query = db.select().from(permits);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query.orderBy(desc(permits.createdAt));
    return results;
  }

  async updatePermit(id: string, updates: Partial<Permit>): Promise<Permit> {
    const [permit] = await db
      .update(permits)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(permits.id, id))
      .returning();
    return permit;
  }

  async generatePermitNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const [result] = await db
      .select({ count: count() })
      .from(permits)
      .where(sql`${permits.permitNumber} LIKE ${`PT-${year}-%`}`);
    
    const nextNumber = (result?.count || 0) + 1;
    return `PT-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Permit history
  async addPermitHistory(historyData: InsertPermitHistory): Promise<PermitHistory> {
    const [history] = await db
      .insert(permitHistory)
      .values(historyData)
      .returning();
    return history;
  }

  async getPermitHistory(permitId: string): Promise<PermitHistory[]> {
    const history = await db
      .select()
      .from(permitHistory)
      .where(eq(permitHistory.permitId, permitId))
      .orderBy(desc(permitHistory.timestamp));
    return history;
  }

  // Dashboard statistics
  async getDashboardStats(userId?: string): Promise<{
    activePermits: number;
    pendingPermits: number;
    approvedToday: number;
    expiringToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Active permits (approved status)
    const [activeResult] = await db
      .select({ count: count() })
      .from(permits)
      .where(eq(permits.status, 'approved'));

    // Pending permits (pending validation or approval)
    const [pendingResult] = await db
      .select({ count: count() })
      .from(permits)
      .where(or(
        eq(permits.status, 'pending_validation'),
        eq(permits.status, 'pending_approval')
      ));

    // Approved today
    const [approvedTodayResult] = await db
      .select({ count: count() })
      .from(permits)
      .where(and(
        eq(permits.status, 'approved'),
        and(
          sql`${permits.updatedAt} >= ${today.toISOString()}`,
          sql`${permits.updatedAt} < ${tomorrow.toISOString()}`
        )
      ));

    // Expiring today (permits with work date today)
    const [expiringTodayResult] = await db
      .select({ count: count() })
      .from(permits)
      .where(and(
        eq(permits.status, 'approved'),
        sql`DATE(${permits.workDate}) = DATE(${today.toISOString()})`
      ));

    return {
      activePermits: activeResult?.count || 0,
      pendingPermits: pendingResult?.count || 0,
      approvedToday: approvedTodayResult?.count || 0,
      expiringToday: expiringTodayResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
