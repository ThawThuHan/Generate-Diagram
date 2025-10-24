import { type User, type InsertUser, type Project, type InsertProject, type Diagram, type InsertDiagram } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Diagram methods
  getDiagramsByProject(projectId: number): Promise<Diagram[]>;
  getDiagram(id: number): Promise<Diagram | undefined>;
  createDiagram(diagram: InsertDiagram): Promise<Diagram>;
  updateDiagram(id: number, diagram: Partial<InsertDiagram>): Promise<Diagram | undefined>;
  deleteDiagram(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<number, Project>;
  private diagrams: Map<number, Diagram>;
  private nextProjectId: number;
  private nextDiagramId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.diagrams = new Map();
    this.nextProjectId = 1;
    this.nextDiagramId = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.nextProjectId++;
    const project: Project = {
      ...insertProject,
      description: insertProject.description ?? null,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated: Project = { ...project, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    const deleted = this.projects.delete(id);
    if (deleted) {
      const diagrams = Array.from(this.diagrams.values()).filter(d => d.projectId === id);
      diagrams.forEach(d => this.diagrams.delete(d.id));
    }
    return deleted;
  }

  // Diagram methods
  async getDiagramsByProject(projectId: number): Promise<Diagram[]> {
    return Array.from(this.diagrams.values())
      .filter(d => d.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getDiagram(id: number): Promise<Diagram | undefined> {
    return this.diagrams.get(id);
  }

  async createDiagram(insertDiagram: InsertDiagram): Promise<Diagram> {
    const id = this.nextDiagramId++;
    const diagram: Diagram = {
      ...insertDiagram,
      id,
      createdAt: new Date(),
    };
    this.diagrams.set(id, diagram);
    return diagram;
  }

  async updateDiagram(id: number, updates: Partial<InsertDiagram>): Promise<Diagram | undefined> {
    const diagram = this.diagrams.get(id);
    if (!diagram) return undefined;
    
    const updated: Diagram = { ...diagram, ...updates };
    this.diagrams.set(id, updated);
    return updated;
  }

  async deleteDiagram(id: number): Promise<boolean> {
    return this.diagrams.delete(id);
  }
}

export class DbStorage implements IStorage {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async getUser(id: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { users } = await import("@shared/schema");
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllProjects(): Promise<Project[]> {
    const { projects } = await import("@shared/schema");
    const { desc } = await import("drizzle-orm");
    return await this.db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const { projects } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const { projects } = await import("@shared/schema");
    const result = await this.db.insert(projects).values(insertProject).returning();
    return result[0];
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const { projects } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: number): Promise<boolean> {
    const { projects, diagrams } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    await this.db.delete(diagrams).where(eq(diagrams.projectId, id));
    const result = await this.db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async getDiagramsByProject(projectId: number): Promise<Diagram[]> {
    const { diagrams } = await import("@shared/schema");
    const { eq, desc } = await import("drizzle-orm");
    return await this.db.select().from(diagrams).where(eq(diagrams.projectId, projectId)).orderBy(desc(diagrams.createdAt));
  }

  async getDiagram(id: number): Promise<Diagram | undefined> {
    const { diagrams } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.select().from(diagrams).where(eq(diagrams.id, id)).limit(1);
    return result[0];
  }

  async createDiagram(insertDiagram: InsertDiagram): Promise<Diagram> {
    const { diagrams } = await import("@shared/schema");
    const result = await this.db.insert(diagrams).values(insertDiagram).returning();
    return result[0];
  }

  async updateDiagram(id: number, updates: Partial<InsertDiagram>): Promise<Diagram | undefined> {
    const { diagrams } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.update(diagrams).set(updates).where(eq(diagrams.id, id)).returning();
    return result[0];
  }

  async deleteDiagram(id: number): Promise<boolean> {
    const { diagrams } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const result = await this.db.delete(diagrams).where(eq(diagrams.id, id)).returning();
    return result.length > 0;
  }
}

// Create storage instance - use DbStorage if DATABASE_URL is set, otherwise fall back to MemStorage
async function createStorage(): Promise<IStorage> {
  if (process.env.DATABASE_URL) {
    const { db } = await import("./db");
    console.log("✓ Using PostgreSQL database storage");
    return new DbStorage(db);
  } else {
    console.log("⚠ Using in-memory storage (data will be lost on restart)");
    return new MemStorage();
  }
}

export const storage = await createStorage();
