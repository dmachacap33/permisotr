import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generatePermitPDF } from "./pdf-generator";
import { insertPermitSchema, permitBasicInfoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Permit routes
  app.post('/api/permits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPermitSchema.parse({
        ...req.body,
        createdBy: userId,
        status: 'draft',
      });
      
      const permit = await storage.createPermit(validatedData);
      res.json(permit);
    } catch (error) {
      console.error("Error creating permit:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create permit" });
      }
    }
  });

  app.get('/api/permits', isAuthenticated, async (req: any, res) => {
    try {
      const { status, type } = req.query;
      const permits = await storage.getPermits({
        status: status as string,
        type: type as string,
      });
      res.json(permits);
    } catch (error) {
      console.error("Error fetching permits:", error);
      res.status(500).json({ message: "Failed to fetch permits" });
    }
  });

  app.get('/api/permits/:id', isAuthenticated, async (req: any, res) => {
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

  app.patch('/api/permits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const permit = await storage.updatePermit(id, req.body);
      
      // Add history entry
      await storage.addPermitHistory({
        permitId: id,
        action: 'updated',
        performedBy: userId,
        comments: req.body.comments || 'Permiso actualizado',
      });
      
      res.json(permit);
    } catch (error) {
      console.error("Error updating permit:", error);
      res.status(500).json({ message: "Failed to update permit" });
    }
  });

  // Permit workflow routes
  app.post('/api/permits/:id/submit-for-validation', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { validatorId, comments } = req.body;
      const userId = req.user.claims.sub;
      
      // Only update validatedBy if a specific validator is provided
      const updateData: any = {
        status: 'pending_validation',
        validationComments: comments,
      };
      
      if (validatorId && validatorId !== null && validatorId !== '') {
        updateData.validatedBy = validatorId;
      }
      
      const permit = await storage.updatePermit(id, updateData);
      
      await storage.addPermitHistory({
        permitId: id,
        action: 'submitted_for_validation',
        performedBy: userId,
        comments: comments || 'Enviado para validación',
      });
      
      res.json(permit);
    } catch (error) {
      console.error("Error submitting permit for validation:", error);
      res.status(500).json({ message: "Failed to submit permit for validation" });
    }
  });

  app.post('/api/permits/:id/validate', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { approved, comments } = req.body;
      const userId = req.user.claims.sub;
      
      const permit = await storage.updatePermit(id, {
        status: approved ? 'pending_approval' : 'rejected',
        validationComments: comments,
      });
      
      await storage.addPermitHistory({
        permitId: id,
        action: approved ? 'validated' : 'rejected_by_validator',
        performedBy: userId,
        comments,
      });
      
      res.json(permit);
    } catch (error) {
      console.error("Error validating permit:", error);
      res.status(500).json({ message: "Failed to validate permit" });
    }
  });

  app.post('/api/permits/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { approved, comments } = req.body;
      const userId = req.user.claims.sub;
      
      const permit = await storage.updatePermit(id, {
        status: approved ? 'approved' : 'rejected',
        approvedBy: userId,
        approvalComments: comments,
      });
      
      await storage.addPermitHistory({
        permitId: id,
        action: approved ? 'approved' : 'rejected_by_supervisor',
        performedBy: userId,
        comments,
      });
      
      res.json(permit);
    } catch (error) {
      console.error("Error approving permit:", error);
      res.status(500).json({ message: "Failed to approve permit" });
    }
  });

  // Close permit
  app.post('/api/permits/:id/close', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const userId = req.user.claims.sub;
      
      const permit = await storage.updatePermit(id, {
        status: 'closed',
        approvalComments: comments,
      });
      
      await storage.addPermitHistory({
        permitId: id,
        action: 'closed',
        performedBy: userId,
        comments: comments || 'Permiso cerrado',
      });
      
      res.json(permit);
    } catch (error) {
      console.error("Error closing permit:", error);
      res.status(500).json({ message: "Failed to close permit" });
    }
  });

  // Generate PDF
  app.get('/api/permits/:id/pdf', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const permit = await storage.getPermit(id);
      
      if (!permit) {
        return res.status(404).json({ message: "Permit not found" });
      }

      // Generate actual PDF using puppeteer
      const pdfBuffer = await generatePermitPDF(permit);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="permiso-${permit.permitNumber}.pdf"`);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Permit history
  app.get('/api/permits/:id/history', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getPermitHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching permit history:", error);
      res.status(500).json({ message: "Failed to fetch permit history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
