import { randomUUID } from "crypto";
import type {
  Permit,
  InsertPermit,
  PermitHistory,
  InsertPermitHistory,
} from "@shared/schema";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

class LocalStorage {
  private permits: Permit[] = [];
  private history: PermitHistory[] = [];

  async createPermit(permitData: Omit<InsertPermit, "permitNumber">): Promise<Permit> {
    const permit: Permit = {
      ...permitData,
      id: randomUUID(),
      permitNumber: await this.generatePermitNumber(),
      status: permitData.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Permit;
    this.permits.push(permit);
    await this.addPermitHistory({
      permitId: permit.id,
      action: "created",
      performedBy: permit.createdBy!,
      comments: "Permiso creado",
    });
    return permit;
  }

  async getPermit(id: string): Promise<Permit | undefined> {
    return this.permits.find((p) => p.id === id);
  }

  async getPermits(filters: {
    status?: string;
    type?: string;
    createdBy?: string;
    validatedBy?: string;
    approvedBy?: string;
  } = {}): Promise<Permit[]> {
    return this.permits.filter((p) => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.createdBy && p.createdBy !== filters.createdBy) return false;
      if (filters.validatedBy && p.validatedBy !== filters.validatedBy) return false;
      if (filters.approvedBy && p.approvedBy !== filters.approvedBy) return false;
      return true;
    });
  }

  async updatePermit(id: string, updates: Partial<Permit>): Promise<Permit> {
    const permit = await this.getPermit(id);
    if (!permit) throw new Error("Permit not found");
    Object.assign(permit, updates, { updatedAt: new Date() });
    return permit;
  }

  async generatePermitNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const next = this.permits.length + 1;
    return `PT-${year}-${next.toString().padStart(3, "0")}`;
  }

  async addPermitHistory(
    historyData: InsertPermitHistory
  ): Promise<PermitHistory> {
    const history: PermitHistory = {
      ...historyData,
      id: randomUUID(),
      timestamp: new Date(),
    } as PermitHistory;
    this.history.push(history);
    return history;
  }

  async getPermitHistory(permitId: string): Promise<PermitHistory[]> {
    return this.history.filter((h) => h.permitId === permitId);
  }

  async getDashboardStats(_userId?: string) {
    const today = new Date();
    const activePermits = this.permits.filter((p) => p.status === "approved").length;
    const pendingPermits = this.permits.filter(
      (p) => p.status === "pending_validation" || p.status === "pending_approval"
    ).length;
    const approvedToday = this.permits.filter(
      (p) => p.status === "approved" && p.updatedAt && sameDay(p.updatedAt, today)
    ).length;
    const expiringToday = this.permits.filter(
      (p) => p.status === "approved" && p.workDate && sameDay(new Date(p.workDate), today)
    ).length;
    return { activePermits, pendingPermits, approvedToday, expiringToday };
  }
}

export const storage = new LocalStorage();
