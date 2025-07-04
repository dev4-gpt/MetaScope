import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSeoAnalysisSchema, seoAnalysisResponseSchema, type SeoAnalysisResponse, type AiSuggestion } from "@shared/schema";
import { z } from "zod";
import * as cheerio from "cheerio";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze URL endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || !isValidURL(url)) {
        return res.status(400).json({ error: "Invalid URL provided" });
      }

      // Fetch HTML content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MetaScope SEO Analyzer)'
        }
      });
      
      if (!response.ok) {
        return res.status(400).json({ error: `Failed to fetch URL: ${response.statusText}` });
      }

      const html = await response.text();
      const analysis = analyzeHTML(html, url);
      
      res.json(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze URL" });
    }
  });

  // Generate AI suggestions endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { type, url, currentTitle, currentDescription } = req.body;
      
      if (!type || !url) {
        return res.status(400).json({ error: "Type and URL are required" });
      }

      const suggestion = await generateAISuggestion(type, url, currentTitle, currentDescription);
      
      res.json(suggestion);
    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({ error: "Failed to generate AI suggestion" });
    }
  });

  // Save analysis endpoint
  app.post("/api/save-analysis", async (req, res) => {
    try {
      const analysisData = insertSeoAnalysisSchema.parse(req.body);
      const analysis = await storage.createSeoAnalysis(analysisData);
      res.json(analysis);
    } catch (error) {
      console.error("Save analysis error:", error);
      res.status(500).json({ error: "Failed to save analysis" });
    }
  });

  // Get user analyses endpoint
  app.get("/api/analyses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const analyses = await storage.getUserSeoAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Get analyses error:", error);
      res.status(500).json({ error: "Failed to get analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function analyzeHTML(html: string, url: string): SeoAnalysisResponse {
  const $ = cheerio.load(html);
  
  // Extract meta tags
  const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDescription = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
  const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
  const twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';
  const twitterImage = $('meta[name="twitter:image"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const robots = $('meta[name="robots"]').attr('content') || '';

  // Content analysis
  const wordCount = $('body').text().split(/\s+/).length;
  const headingStructure = $('h1').length === 1 && $('h2, h3, h4, h5, h6').length > 0;
  const images = $('img');
  const imagesWithAlt = images.filter('[alt]');
  const internalLinks = $('a[href^="/"], a[href*="' + new URL(url).hostname + '"]').length;

  // Technical SEO
  const hasHttps = url.startsWith('https://');
  const hasViewport = $('meta[name="viewport"]').length > 0;

  // Generate audit results
  const auditResults = [
    {
      type: 'title',
      status: title.length >= 30 && title.length <= 60 ? 'pass' : title.length > 0 ? 'warn' : 'fail' as const,
      title: 'Page Title',
      description: title.length === 0 ? 'No title tag found' : 
                  title.length < 30 ? 'Title is too short (< 30 characters)' :
                  title.length > 60 ? 'Title is too long (> 60 characters)' :
                  'Well-structured title tag found',
      value: title,
    },
    {
      type: 'description',
      status: metaDescription.length >= 120 && metaDescription.length <= 160 ? 'pass' : metaDescription.length > 0 ? 'warn' : 'fail' as const,
      title: 'Meta Description',
      description: metaDescription.length === 0 ? 'No meta description found' :
                  metaDescription.length < 120 ? 'Description is too short (< 120 characters)' :
                  metaDescription.length > 160 ? 'Description is too long (> 160 characters)' :
                  'Well-structured meta description found',
      value: metaDescription,
    },
    {
      type: 'og_image',
      status: ogImage ? 'pass' : 'fail' as const,
      title: 'Open Graph Image',
      description: ogImage ? 'Open Graph image found' : 'No og:image meta tag found. This affects social media sharing.',
      value: ogImage,
    },
    {
      type: 'canonical',
      status: canonical ? 'pass' : 'warn' as const,
      title: 'Canonical URL',
      description: canonical ? 'Proper canonical tag implementation found' : 'No canonical URL specified',
      value: canonical,
    },
    {
      type: 'twitter_card',
      status: twitterCard ? 'pass' : 'fail' as const,
      title: 'Twitter Card',
      description: twitterCard ? 'Twitter card meta tags found' : 'No Twitter card meta tags found',
      value: twitterCard,
    },
    {
      type: 'schema',
      status: $('script[type="application/ld+json"]').length > 0 ? 'pass' : 'fail' as const,
      title: 'Schema Markup',
      description: $('script[type="application/ld+json"]').length > 0 ? 'Structured data found' : 'No structured data found. Consider adding JSON-LD schema.',
    },
  ];

  // Calculate SEO score
  const seoScore = calculateSEOScore(auditResults, {
    hasTitle: !!title,
    hasDescription: !!metaDescription,
    hasOgImage: !!ogImage,
    hasCanonical: !!canonical,
    hasTwitterCard: !!twitterCard,
    hasSchema: $('script[type="application/ld+json"]').length > 0,
    hasViewport,
    hasHttps,
    headingStructure,
  });

  return {
    url,
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    canonical,
    robots,
    seoScore,
    auditResults,
    technicalSeo: {
      hasHttps,
      isMobileFriendly: hasViewport,
      hasRobotsTxt: false, // Would need to check /robots.txt
      pageSpeed: 'Good', // Would need PageSpeed API
    },
    contentAnalysis: {
      wordCount,
      headingStructure,
      imageAltCount: imagesWithAlt.length,
      missingAltCount: images.length - imagesWithAlt.length,
      internalLinks,
    },
  };
}

function calculateSEOScore(auditResults: any[], factors: any): number {
  let score = 0;
  
  // Title (20 points)
  if (factors.hasTitle) score += auditResults.find(r => r.type === 'title')?.status === 'pass' ? 20 : 10;
  
  // Meta Description (20 points)
  if (factors.hasDescription) score += auditResults.find(r => r.type === 'description')?.status === 'pass' ? 20 : 10;
  
  // Open Graph (15 points)
  if (factors.hasOgImage) score += 15;
  
  // Twitter Card (10 points)
  if (factors.hasTwitterCard) score += 10;
  
  // Canonical (10 points)
  if (factors.hasCanonical) score += 10;
  
  // Schema (10 points)
  if (factors.hasSchema) score += 10;
  
  // Technical factors (15 points)
  if (factors.hasHttps) score += 5;
  if (factors.hasViewport) score += 5;
  if (factors.headingStructure) score += 5;
  
  return Math.min(score, 100);
}

async function generateAISuggestion(type: string, url: string, currentTitle?: string, currentDescription?: string): Promise<AiSuggestion> {
  const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY || 'hf_demo_key';
  
  let prompt = '';
  
  switch (type) {
    case 'description':
      prompt = `Generate an engaging SEO meta description for the website: ${url}. Current title: ${currentTitle || 'Not provided'}. The description should be between 120-160 characters and compelling for search results.`;
      break;
    case 'title':
      prompt = `Generate an SEO-optimized page title for the website: ${url}. Current description: ${currentDescription || 'Not provided'}. The title should be between 30-60 characters and include relevant keywords.`;
      break;
    case 'og_tags':
      prompt = `Generate Open Graph title and description for the website: ${url}. Make them engaging for social media sharing.`;
      break;
    default:
      prompt = `Generate SEO content for ${type} for the website: ${url}`;
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-base', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 200,
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    const generatedText = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
    
    return {
      type,
      title: type === 'description' ? 'Improved Meta Description' : 
             type === 'title' ? 'Optimized Page Title' : 
             'AI Generated Content',
      content: generatedText || 'Unable to generate suggestion at this time.',
      characterCount: generatedText?.length || 0,
    };
  } catch (error) {
    console.error('Hugging Face API error:', error);
    
    // Fallback suggestions
    const fallbackSuggestions = {
      description: 'Discover our comprehensive solution for your needs. Learn more about our services, features, and how we can help you achieve your goals. Get started today.',
      title: 'Professional Services | Your Trusted Partner',
      og_tags: 'Your comprehensive solution for professional services and expert guidance.',
    };
    
    return {
      type,
      title: 'AI Generated Content (Fallback)',
      content: fallbackSuggestions[type as keyof typeof fallbackSuggestions] || 'Generated content suggestion',
      characterCount: fallbackSuggestions[type as keyof typeof fallbackSuggestions]?.length || 0,
    };
  }
}
