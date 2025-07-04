import { users, seoAnalyses, type User, type InsertUser, type SeoAnalysis, type InsertSeoAnalysis } from "@shared/schema";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSeoAnalysis(analysis: InsertSeoAnalysis): Promise<SeoAnalysis>;
  getUserSeoAnalyses(userId: number): Promise<SeoAnalysis[]>;
  getSeoAnalysis(id: number): Promise<SeoAnalysis | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private seoAnalyses: Map<number, SeoAnalysis>;
  private currentUserId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.seoAnalyses = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      email: insertUser.email,
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null,
      firebaseUid: insertUser.firebaseUid,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async createSeoAnalysis(insertAnalysis: InsertSeoAnalysis): Promise<SeoAnalysis> {
    const id = this.currentAnalysisId++;
    const analysis: SeoAnalysis = { 
      id,
      userId: insertAnalysis.userId || null,
      url: insertAnalysis.url,
      title: insertAnalysis.title || null,
      metaDescription: insertAnalysis.metaDescription || null,
      ogTitle: insertAnalysis.ogTitle || null,
      ogDescription: insertAnalysis.ogDescription || null,
      ogImage: insertAnalysis.ogImage || null,
      twitterCard: insertAnalysis.twitterCard || null,
      twitterTitle: insertAnalysis.twitterTitle || null,
      twitterDescription: insertAnalysis.twitterDescription || null,
      twitterImage: insertAnalysis.twitterImage || null,
      canonical: insertAnalysis.canonical || null,
      robots: insertAnalysis.robots || null,
      seoScore: insertAnalysis.seoScore || null,
      auditResults: insertAnalysis.auditResults || null,
      aiSuggestions: insertAnalysis.aiSuggestions || null,
      createdAt: new Date(),
    };
    this.seoAnalyses.set(id, analysis);
    return analysis;
  }

  async getUserSeoAnalyses(userId: number): Promise<SeoAnalysis[]> {
    return Array.from(this.seoAnalyses.values()).filter(
      (analysis) => analysis.userId === userId,
    );
  }

  async getSeoAnalysis(id: number): Promise<SeoAnalysis | undefined> {
    return this.seoAnalyses.get(id);
  }
}

// Initialize Firebase Admin with service account
let db: any = null;

// Get service account from environment variable
let serviceAccount: any = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    console.warn("⚠ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment variables");
  }
} catch (error) {
  console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
}

try {
  // Check if Firebase app is already initialized
  let app;
  if (serviceAccount && getApps().length === 0) {
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log("✓ Firebase Admin initialized successfully");
    db = getFirestore(app);
    console.log("✓ Firestore database connected");
  } else if (getApps().length > 0) {
    app = getApps()[0];
    db = getFirestore(app);
    console.log("✓ Firestore database connected");
  } else {
    console.warn("⚠ No Firebase service account found - using memory storage");
  }
} catch (error) {
  console.warn("❌ Firebase Admin initialization failed:", error);
  console.log("⚠ Using memory storage as fallback");
}

export class FirestoreStorage implements IStorage {
  private db: any;
  private currentUserId: number = 1;
  private currentAnalysisId: number = 1;

  constructor(firestoreDb: any) {
    this.db = firestoreDb;
  }

  async getUser(id: number): Promise<User | undefined> {
    if (!this.db) return undefined;
    
    try {
      const doc = await this.db.collection('users').doc(id.toString()).get();
      if (!doc.exists) return undefined;
      return { id, ...doc.data() } as User;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    if (!this.db) return undefined;
    
    try {
      const snapshot = await this.db.collection('users')
        .where('firebaseUid', '==', firebaseUid)
        .limit(1)
        .get();
      
      if (snapshot.empty) return undefined;
      
      const doc = snapshot.docs[0];
      return { id: parseInt(doc.id), ...doc.data() } as User;
    } catch (error) {
      console.error("Error getting user by Firebase UID:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.db) {
      // Fallback to memory storage behavior
      const id = this.currentUserId++;
      const user: User = { 
        id,
        email: insertUser.email,
        displayName: insertUser.displayName || null,
        photoURL: insertUser.photoURL || null,
        firebaseUid: insertUser.firebaseUid,
        createdAt: new Date(),
      };
      return user;
    }

    try {
      const id = this.currentUserId++;
      const userData = {
        ...insertUser,
        createdAt: new Date(),
      };
      
      await this.db.collection('users').doc(id.toString()).set(userData);
      
      return { id, ...userData } as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async createSeoAnalysis(insertAnalysis: InsertSeoAnalysis): Promise<SeoAnalysis> {
    if (!this.db) {
      // Fallback to memory storage behavior
      const id = this.currentAnalysisId++;
      const analysis: SeoAnalysis = { 
        id,
        userId: insertAnalysis.userId || null,
        url: insertAnalysis.url,
        title: insertAnalysis.title || null,
        metaDescription: insertAnalysis.metaDescription || null,
        ogTitle: insertAnalysis.ogTitle || null,
        ogDescription: insertAnalysis.ogDescription || null,
        ogImage: insertAnalysis.ogImage || null,
        twitterCard: insertAnalysis.twitterCard || null,
        twitterTitle: insertAnalysis.twitterTitle || null,
        twitterDescription: insertAnalysis.twitterDescription || null,
        twitterImage: insertAnalysis.twitterImage || null,
        canonical: insertAnalysis.canonical || null,
        robots: insertAnalysis.robots || null,
        seoScore: insertAnalysis.seoScore || null,
        auditResults: insertAnalysis.auditResults || null,
        aiSuggestions: insertAnalysis.aiSuggestions || null,
        createdAt: new Date(),
      };
      return analysis;
    }

    try {
      const id = this.currentAnalysisId++;
      const analysisData = {
        ...insertAnalysis,
        createdAt: new Date(),
      };
      
      await this.db.collection('seoAnalyses').doc(id.toString()).set(analysisData);
      
      return { id, ...analysisData } as SeoAnalysis;
    } catch (error) {
      console.error("Error creating SEO analysis:", error);
      throw error;
    }
  }

  async getUserSeoAnalyses(userId: number): Promise<SeoAnalysis[]> {
    if (!this.db) return [];
    
    try {
      const snapshot = await this.db.collection('seoAnalyses')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map((doc: any) => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as SeoAnalysis[];
    } catch (error) {
      console.error("Error getting user SEO analyses:", error);
      return [];
    }
  }

  async getSeoAnalysis(id: number): Promise<SeoAnalysis | undefined> {
    if (!this.db) return undefined;
    
    try {
      const doc = await this.db.collection('seoAnalyses').doc(id.toString()).get();
      if (!doc.exists) return undefined;
      return { id, ...doc.data() } as SeoAnalysis;
    } catch (error) {
      console.error("Error getting SEO analysis:", error);
      return undefined;
    }
  }
}

export const storage = db ? new FirestoreStorage(db) : new MemStorage();
