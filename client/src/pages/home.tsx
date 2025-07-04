import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { UrlInput } from "@/components/url-input";
import { SeoScore } from "@/components/seo-score";
import { SocialPreviews } from "@/components/social-previews";
import { MetadataAudit } from "@/components/metadata-audit";
import { AiSuggestions } from "@/components/ai-suggestions";
import { DetailedAnalysis } from "@/components/detailed-analysis";
import { apiRequest } from "@/lib/queryClient";
import { type SeoAnalysisResponse, type AiSuggestion } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Analysis query
  const {
    data: analysis,
    isLoading: isAnalyzing,
    error: analysisError,
  } = useQuery<SeoAnalysisResponse>({
    queryKey: ["/api/analyze", currentUrl],
    enabled: !!currentUrl,
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/analyze", { url: currentUrl });
      return response.json();
    },
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/analyze", { url });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/analyze", currentUrl], data);
      toast({
        title: "Analysis Complete",
        description: `SEO score: ${data.seoScore}/100`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the URL",
        variant: "destructive",
      });
    },
  });

  // AI generation mutation
  const aiGenerationMutation = useMutation({
    mutationFn: async (params: { type: string; url: string; currentTitle?: string; currentDescription?: string }) => {
      const response = await apiRequest("POST", "/api/generate", params);
      return response.json();
    },
    onSuccess: (data) => {
      setAiSuggestions(prev => [...prev, data]);
      toast({
        title: "AI Suggestion Generated",
        description: "New suggestion has been added to the list",
      });
    },
    onError: (error: any) => {
      toast({
        title: "AI Generation Failed",
        description: error.message || "Failed to generate suggestion",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = (url: string) => {
    setCurrentUrl(url);
    setAiSuggestions([]);
    analysisMutation.mutate(url);
  };

  const handleGenerateTags = () => {
    if (!analysis) return;

    const missingTags = analysis.auditResults.filter(item => item.status === "fail");
    
    missingTags.forEach(tag => {
      let type = "description";
      if (tag.type === "title") type = "title";
      else if (tag.type === "og_image" || tag.type === "og_title") type = "og_tags";
      
      aiGenerationMutation.mutate({
        type,
        url: currentUrl,
        currentTitle: analysis.title,
        currentDescription: analysis.metaDescription,
      });
    });
  };

  const handleExportPDF = () => {
    if (!analysis) {
      toast({
        title: "No Analysis Available",
        description: "Please analyze a URL first before exporting",
        variant: "destructive",
      });
      return;
    }

    // Basic PDF export using window.print()
    // In production, you would use a proper PDF library like html2pdf.js
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MetaScope SEO Analysis - ${analysis.url}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .score { font-size: 24px; font-weight: bold; color: #4F46E5; }
              .audit-item { margin-bottom: 15px; padding: 10px; border-left: 4px solid #ddd; }
              .pass { border-left-color: #10B981; }
              .warn { border-left-color: #F59E0B; }
              .fail { border-left-color: #EF4444; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>MetaScope SEO Analysis</h1>
              <p><strong>URL:</strong> ${analysis.url}</p>
              <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p class="score">SEO Score: ${analysis.seoScore}/100</p>
            </div>
            
            <h2>Audit Results</h2>
            ${analysis.auditResults.map(item => `
              <div class="audit-item ${item.status}">
                <h3>${item.title} - ${item.status.toUpperCase()}</h3>
                <p>${item.description}</p>
                ${item.value ? `<p><strong>Value:</strong> ${item.value}</p>` : ''}
              </div>
            `).join('')}
            
            <h2>Technical SEO</h2>
            <ul>
              <li>HTTPS: ${analysis.technicalSeo.hasHttps ? 'Yes' : 'No'}</li>
              <li>Mobile Friendly: ${analysis.technicalSeo.isMobileFriendly ? 'Yes' : 'No'}</li>
              <li>Page Speed: ${analysis.technicalSeo.pageSpeed}</li>
            </ul>
            
            <h2>Content Analysis</h2>
            <ul>
              <li>Word Count: ${analysis.contentAnalysis.wordCount}</li>
              <li>Heading Structure: ${analysis.contentAnalysis.headingStructure ? 'Proper' : 'Needs Work'}</li>
              <li>Images Missing Alt Text: ${analysis.contentAnalysis.missingAltCount}</li>
              <li>Internal Links: ${analysis.contentAnalysis.internalLinks}</li>
            </ul>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Export Initiated",
      description: "PDF export dialog opened",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onExportPDF={handleExportPDF} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <UrlInput 
          onAnalyze={handleAnalyze} 
          isLoading={analysisMutation.isPending}
        />

        {(analysis || analysisMutation.isPending) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <SeoScore 
                score={analysis?.seoScore || 0} 
                isLoading={analysisMutation.isPending}
              />
            </div>
            <div className="lg:col-span-2">
              <SocialPreviews 
                analysis={analysis} 
                isLoading={analysisMutation.isPending}
              />
            </div>
          </div>
        )}

        {(analysis || analysisMutation.isPending) && (
          <div className="space-y-8">
            <MetadataAudit 
              analysis={analysis} 
              isLoading={analysisMutation.isPending}
              onGenerateTags={handleGenerateTags}
            />

            <AiSuggestions 
              suggestions={aiSuggestions}
              isLoading={aiGenerationMutation.isPending}
            />

            <DetailedAnalysis 
              analysis={analysis} 
              isLoading={analysisMutation.isPending}
            />
          </div>
        )}

        {analysisError && (
          <div className="text-center py-8">
            <p className="text-destructive">
              Failed to analyze URL. Please check the URL and try again.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
