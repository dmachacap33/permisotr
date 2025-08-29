// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/localStorage.ts
import { randomUUID } from "crypto";
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
var LocalStorage = class {
  permits = [];
  history = [];
  async createPermit(permitData) {
    const permit = {
      ...permitData,
      id: randomUUID(),
      permitNumber: await this.generatePermitNumber(),
      status: permitData.status || "draft",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.permits.push(permit);
    await this.addPermitHistory({
      permitId: permit.id,
      action: "created",
      performedBy: permit.createdBy,
      comments: "Permiso creado"
    });
    return permit;
  }
  async getPermit(id) {
    return this.permits.find((p) => p.id === id);
  }
  async getPermits(filters = {}) {
    return this.permits.filter((p) => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.createdBy && p.createdBy !== filters.createdBy) return false;
      if (filters.validatedBy && p.validatedBy !== filters.validatedBy) return false;
      if (filters.approvedBy && p.approvedBy !== filters.approvedBy) return false;
      return true;
    });
  }
  async updatePermit(id, updates) {
    const permit = await this.getPermit(id);
    if (!permit) throw new Error("Permit not found");
    Object.assign(permit, updates, { updatedAt: /* @__PURE__ */ new Date() });
    return permit;
  }
  async generatePermitNumber() {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const next = this.permits.length + 1;
    return `PT-${year}-${next.toString().padStart(3, "0")}`;
  }
  async addPermitHistory(historyData) {
    const history = {
      ...historyData,
      id: randomUUID(),
      timestamp: /* @__PURE__ */ new Date()
    };
    this.history.push(history);
    return history;
  }
  async getPermitHistory(permitId) {
    return this.history.filter((h) => h.permitId === permitId);
  }
  async getDashboardStats(_userId) {
    const today = /* @__PURE__ */ new Date();
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
};
var storage = new LocalStorage();

// server/localAuth.ts
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { randomUUID as randomUUID2 } from "crypto";
var users = [];
async function setupAuth(app2) {
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, done) => {
        const user = users.find(
          (u) => u.email === email && u.password === password
        );
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    const user = users.find((u) => u.id === id);
    done(null, user || false);
  });
  app2.post("/api/register", (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (users.some((u) => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = {
      id: randomUUID2(),
      email,
      password,
      firstName,
      lastName
    };
    users.push(newUser);
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: "Registration failed" });
      }
      const { password: _pw, ...userWithoutPassword } = newUser;
      res.json(userWithoutPassword);
    });
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user;
    const { password: _pw, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  app2.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });
}
var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

// server/pdf-generator.ts
import puppeteer from "puppeteer";
async function generatePermitPDF(permit) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const page = await browser.newPage();
    const htmlContent = generatePermitHTML(permit);
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0"
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm"
      }
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
function generatePermitHTML(permit) {
  const permitTypeMap = {
    excavation: "Excavaci\xF3n FS.019",
    hot: "Trabajo en Caliente FS.020",
    cold: "Trabajo en Fr\xEDo FS.021"
  };
  const permitTypeName = permitTypeMap[permit.type] || permit.type;
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Permiso de Trabajo - ${permit.permitNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .header h2 {
            font-size: 14px;
            color: #666;
        }
        
        .permit-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-section {
            border: 1px solid #ddd;
            padding: 10px;
        }
        
        .info-section h3 {
            background-color: #f5f5f5;
            padding: 5px;
            margin: -10px -10px 10px -10px;
            font-size: 13px;
            font-weight: bold;
        }
        
        .field {
            margin-bottom: 8px;
        }
        
        .field-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        
        .field-value {
            display: inline-block;
        }
        
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-approved {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-draft {
            background-color: #e2e3e5;
            color: #383d41;
        }
        
        .checklist-section {
            margin-top: 20px;
            page-break-inside: avoid;
        }
        
        .checklist-section h3 {
            background-color: #007bff;
            color: white;
            padding: 8px;
            margin-bottom: 10px;
        }
        
        .checklist-item {
            display: flex;
            justify-content: space-between;
            padding: 5px;
            border-bottom: 1px solid #eee;
        }
        
        .ppe-section {
            margin-top: 20px;
        }
        
        .ppe-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .ppe-item {
            padding: 3px 0;
        }
        
        .checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #333;
            margin-right: 5px;
            vertical-align: middle;
        }
        
        .checkbox.checked {
            background-color: #000;
        }
        
        .signatures {
            margin-top: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
        }
        
        .signature-box {
            border: 1px solid #333;
            height: 80px;
            padding: 10px;
            text-align: center;
        }
        
        .signature-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        @media print {
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>YACIMIENTOS PETROL\xCDFEROS FISCALES BOLIVIANOS</h1>
        <h2>PERMISO DE TRABAJO - ${permitTypeName}</h2>
        <p><strong>N\xFAmero:</strong> ${permit.permitNumber}</p>
    </div>

    <div class="permit-info">
        <div class="info-section">
            <h3>Informaci\xF3n B\xE1sica</h3>
            <div class="field">
                <span class="field-label">Ejecutor:</span>
                <span class="field-value">${permit.executorCompany || "N/A"}</span>
            </div>
            <div class="field">
                <span class="field-label">Estaci\xF3n/Ducto:</span>
                <span class="field-value">${permit.stationDuct || "N/A"}</span>
            </div>
            <div class="field">
                <span class="field-label">\xC1rea/Sitio:</span>
                <span class="field-value">${permit.areaSite || "N/A"}</span>
            </div>
            <div class="field">
                <span class="field-label">Orden de Trabajo:</span>
                <span class="field-value">${permit.workOrderNumber || "N/A"}</span>
            </div>
        </div>
        
        <div class="info-section">
            <h3>Detalles del Trabajo</h3>
            <div class="field">
                <span class="field-label">Descripci\xF3n:</span>
                <span class="field-value">${permit.workDescription || "N/A"}</span>
            </div>
            <div class="field">
                <span class="field-label">Fecha:</span>
                <span class="field-value">${permit.workDate ? new Date(permit.workDate).toLocaleDateString() : "N/A"}</span>
            </div>
            <div class="field">
                <span class="field-label">V\xE1lido de:</span>
                <span class="field-value">${permit.validFrom || "N/A"} a ${permit.validTo || "N/A"}</span>
            </div>
            <div class="field">
                <span class="field-label">Estado:</span>
                <span class="status-badge status-${permit.status}">${permit.status?.toUpperCase()}</span>
            </div>
        </div>
    </div>

    ${permit.ppeRequirements && permit.ppeRequirements.length > 0 ? `
    <div class="ppe-section">
        <h3>Equipo de Protecci\xF3n Personal Requerido</h3>
        <div class="ppe-grid">
            ${permit.ppeRequirements.map((item) => `
                <div class="ppe-item">
                    <span class="checkbox checked"></span>
                    ${item}
                </div>
            `).join("")}
        </div>
    </div>
    ` : ""}

    ${permit.checklistResponses ? `
    <div class="checklist-section">
        <h3>Lista de Verificaci\xF3n de Seguridad</h3>
        ${Object.entries(permit.checklistResponses).map(([question, answer]) => `
            <div class="checklist-item">
                <span>${question}</span>
                <span><strong>${answer.toUpperCase()}</strong></span>
            </div>
        `).join("")}
    </div>
    ` : ""}

    ${permit.specialInstructions ? `
    <div class="info-section" style="margin-top: 20px;">
        <h3>Instrucciones Especiales</h3>
        <p>${permit.specialInstructions}</p>
    </div>
    ` : ""}

    <div class="signatures">
        <div class="signature-box">
            <div class="signature-title">SOLICITANTE</div>
            <div style="margin-top: 40px;">
                <div>_____________________</div>
                <div>Firma y Fecha</div>
            </div>
        </div>
        
        <div class="signature-box">
            <div class="signature-title">VALIDADOR</div>
            <div style="margin-top: 40px;">
                <div>_____________________</div>
                <div>Firma y Fecha</div>
            </div>
        </div>
        
        <div class="signature-box">
            <div class="signature-title">SUPERVISOR</div>
            <div style="margin-top: 40px;">
                <div>_____________________</div>
                <div>Firma y Fecha</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Documento generado el ${(/* @__PURE__ */ new Date()).toLocaleDateString()} a las ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}</p>
        <p>YPFB - Yacimientos Petrol\xEDferos Fiscales Bolivianos</p>
        <p>Sistema de Gesti\xF3n de Permisos de Trabajo</p>
    </div>
</body>
</html>
  `;
}

// shared/schema.ts
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users2 = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "supervisor", "user", "operator"] }).default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var permits = pgTable("permits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  permitNumber: varchar("permit_number").unique().notNull(),
  type: varchar("type", { enum: ["excavation", "hot", "cold"] }).notNull(),
  status: varchar("status", { enum: ["draft", "pending_validation", "pending_approval", "approved", "rejected", "expired"] }).default("draft"),
  // Basic information
  executorCompany: text("executor_company"),
  stationDuct: text("station_duct"),
  areaSite: text("area_site"),
  workOrderNumber: text("work_order_number"),
  workDescription: text("work_description"),
  workDate: timestamp("work_date"),
  validFrom: text("valid_from"),
  // time as string HH:MM
  validTo: text("valid_to"),
  // time as string HH:MM
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
  createdBy: varchar("created_by").references(() => users2.id),
  validatedBy: varchar("validated_by").references(() => users2.id),
  approvedBy: varchar("approved_by").references(() => users2.id),
  // Comments
  validationComments: text("validation_comments"),
  approvalComments: text("approval_comments"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var permitHistory = pgTable("permit_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  permitId: varchar("permit_id").references(() => permits.id),
  action: varchar("action").notNull(),
  // created, validated, approved, rejected, etc.
  performedBy: varchar("performed_by").references(() => users2.id),
  comments: text("comments"),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertUserSchema = createInsertSchema(users2);
var insertPermitSchema = createInsertSchema(permits).omit({
  id: true,
  permitNumber: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Make type required for creation
  type: z.enum(["excavation", "hot", "cold"]),
  // Convert string date to Date object
  workDate: z.string().transform((val) => new Date(val))
});
var insertPermitHistorySchema = createInsertSchema(permitHistory).omit({
  id: true,
  timestamp: true
});
var permitBasicInfoSchema = z.object({
  executorCompany: z.string().min(1, "Empresa/ejecutor requerido"),
  stationDuct: z.string().min(1, "Estaci\xF3n/ducto requerido"),
  areaSite: z.string().min(1, "\xC1rea/sitio requerido"),
  workOrderNumber: z.string().min(1, "N\xFAmero de orden requerido"),
  workDescription: z.string().min(1, "Descripci\xF3n del trabajo requerida"),
  workDate: z.date(),
  validFrom: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inv\xE1lido"),
  validTo: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inv\xE1lido")
});

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.post("/api/permits", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertPermitSchema.parse({
        ...req.body,
        createdBy: userId,
        status: "draft"
      });
      const permit = await storage.createPermit(validatedData);
      res.json(permit);
    } catch (error) {
      console.error("Error creating permit:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create permit" });
      }
    }
  });
  app2.get("/api/permits", isAuthenticated, async (req, res) => {
    try {
      const { status, type } = req.query;
      const permits2 = await storage.getPermits({
        status,
        type
      });
      res.json(permits2);
    } catch (error) {
      console.error("Error fetching permits:", error);
      res.status(500).json({ message: "Failed to fetch permits" });
    }
  });
  app2.get("/api/permits/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const permit = await storage.getPermit(id);
      if (!permit) {
        return res.status(404).json({ message: "Permit not found" });
      }
      res.json(permit);
    } catch (error) {
      console.error("Error fetching permit:", error);
      res.status(500).json({ message: "Failed to fetch permit" });
    }
  });
  app2.patch("/api/permits/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const permit = await storage.updatePermit(id, req.body);
      await storage.addPermitHistory({
        permitId: id,
        action: "updated",
        performedBy: userId,
        comments: req.body.comments || "Permiso actualizado"
      });
      res.json(permit);
    } catch (error) {
      console.error("Error updating permit:", error);
      res.status(500).json({ message: "Failed to update permit" });
    }
  });
  app2.post("/api/permits/:id/submit-for-validation", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { validatorId, comments } = req.body;
      const userId = req.user.id;
      const updateData = {
        status: "pending_validation",
        validationComments: comments
      };
      if (validatorId && validatorId !== null && validatorId !== "") {
        updateData.validatedBy = validatorId;
      }
      const permit = await storage.updatePermit(id, updateData);
      await storage.addPermitHistory({
        permitId: id,
        action: "submitted_for_validation",
        performedBy: userId,
        comments: comments || "Enviado para validaci\xF3n"
      });
      res.json(permit);
    } catch (error) {
      console.error("Error submitting permit for validation:", error);
      res.status(500).json({ message: "Failed to submit permit for validation" });
    }
  });
  app2.post("/api/permits/:id/validate", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { approved, comments } = req.body;
      const userId = req.user.id;
      const permit = await storage.updatePermit(id, {
        status: approved ? "pending_approval" : "rejected",
        validationComments: comments
      });
      await storage.addPermitHistory({
        permitId: id,
        action: approved ? "validated" : "rejected_by_validator",
        performedBy: userId,
        comments
      });
      res.json(permit);
    } catch (error) {
      console.error("Error validating permit:", error);
      res.status(500).json({ message: "Failed to validate permit" });
    }
  });
  app2.post("/api/permits/:id/approve", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { approved, comments } = req.body;
      const userId = req.user.id;
      const permit = await storage.updatePermit(id, {
        status: approved ? "approved" : "rejected",
        approvedBy: userId,
        approvalComments: comments
      });
      await storage.addPermitHistory({
        permitId: id,
        action: approved ? "approved" : "rejected_by_supervisor",
        performedBy: userId,
        comments
      });
      res.json(permit);
    } catch (error) {
      console.error("Error approving permit:", error);
      res.status(500).json({ message: "Failed to approve permit" });
    }
  });
  app2.post("/api/permits/:id/close", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const userId = req.user.id;
      const permit = await storage.updatePermit(id, {
        status: "closed",
        approvalComments: comments
      });
      await storage.addPermitHistory({
        permitId: id,
        action: "closed",
        performedBy: userId,
        comments: comments || "Permiso cerrado"
      });
      res.json(permit);
    } catch (error) {
      console.error("Error closing permit:", error);
      res.status(500).json({ message: "Failed to close permit" });
    }
  });
  app2.get("/api/permits/:id/pdf", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const permit = await storage.getPermit(id);
      if (!permit) {
        return res.status(404).json({ message: "Permit not found" });
      }
      const pdfBuffer = await generatePermitPDF(permit);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="permiso-${permit.permitNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });
  app2.get("/api/permits/:id/history", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getPermitHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching permit history:", error);
      res.status(500).json({ message: "Failed to fetch permit history" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  console.log("--- Searching for Preview URL in Environment Variables ---");
  console.log(process.env);
  console.log("----------------------------------------------------------");
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
