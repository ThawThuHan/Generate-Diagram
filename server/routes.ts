import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertDiagramSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Diagram routes
  app.get("/api/projects/:projectId/diagrams", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const diagrams = await storage.getDiagramsByProject(projectId);
      res.json(diagrams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diagrams" });
    }
  });

  app.get("/api/diagrams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const diagram = await storage.getDiagram(id);
      if (!diagram) {
        return res.status(404).json({ error: "Diagram not found" });
      }
      res.json(diagram);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diagram" });
    }
  });

  app.post("/api/diagrams", async (req, res) => {
    try {
      const data = insertDiagramSchema.parse(req.body);
      const diagram = await storage.createDiagram(data);
      res.status(201).json(diagram);
    } catch (error) {
      res.status(400).json({ error: "Invalid diagram data" });
    }
  });

  app.patch("/api/diagrams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertDiagramSchema.partial().parse(req.body);
      const diagram = await storage.updateDiagram(id, data);
      if (!diagram) {
        return res.status(404).json({ error: "Diagram not found" });
      }
      res.json(diagram);
    } catch (error) {
      res.status(400).json({ error: "Invalid diagram data" });
    }
  });

  app.delete("/api/diagrams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDiagram(id);
      if (!deleted) {
        return res.status(404).json({ error: "Diagram not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete diagram" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
