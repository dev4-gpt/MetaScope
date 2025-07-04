import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  firebaseUid: text("firebase_uid").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const seoAnalyses = pgTable("seo_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  url: text("url").notNull(),
  title: text("title"),
  metaDescription: text("meta_description"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  twitterCard: text("twitter_card"),
  twitterTitle: text("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image"),
  canonical: text("canonical"),
  robots: text("robots"),
  seoScore: integer("seo_score"),
  auditResults: jsonb("audit_results"),
  aiSuggestions: jsonb("ai_suggestions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSeoAnalysisSchema = createInsertSchema(seoAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSeoAnalysis = z.infer<typeof insertSeoAnalysisSchema>;
export type SeoAnalysis = typeof seoAnalyses.$inferSelect;

// SEO Analysis Response Types
export const seoAnalysisResponseSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  metaDescription: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterCard: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  canonical: z.string().optional(),
  robots: z.string().optional(),
  seoScore: z.number(),
  auditResults: z.array(z.object({
    type: z.string(),
    status: z.enum(["pass", "warn", "fail"]),
    title: z.string(),
    description: z.string(),
    value: z.string().optional(),
    suggestion: z.string().optional(),
  })),
  technicalSeo: z.object({
    hasHttps: z.boolean(),
    isMobileFriendly: z.boolean(),
    hasRobotsTxt: z.boolean(),
    pageSpeed: z.string(),
  }),
  contentAnalysis: z.object({
    wordCount: z.number(),
    headingStructure: z.boolean(),
    imageAltCount: z.number(),
    missingAltCount: z.number(),
    internalLinks: z.number(),
  }),
});

export type SeoAnalysisResponse = z.infer<typeof seoAnalysisResponseSchema>;

export const aiSuggestionSchema = z.object({
  type: z.string(),
  title: z.string(),
  content: z.string(),
  characterCount: z.number().optional(),
});

export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;
