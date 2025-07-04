import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type SeoAnalysisResponse } from "@shared/schema";
import { Chrome, Twitter, Facebook, Image } from "lucide-react";

interface SocialPreviewsProps {
  analysis: SeoAnalysisResponse | null;
  isLoading: boolean;
}

export function SocialPreviews({ analysis, isLoading }: SocialPreviewsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Social Media Previews</h3>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const domain = new URL(analysis.url).hostname;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Social Media Previews</h3>
        
        {/* Google Search Preview */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
            <Chrome className="text-blue-400 mr-2" size={16} />
            Google Search Result
          </h4>
          <div className="bg-background border rounded-lg p-4">
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Chrome className="text-green-600 mr-2" size={12} />
              <span>{domain}</span>
            </div>
            <h5 className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
              {analysis.title || "No title found"}
            </h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.metaDescription || "No meta description found"}
            </p>
          </div>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Twitter Card */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
              <Twitter className="text-blue-400 mr-2" size={16} />
              Twitter Card
            </h4>
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {analysis.twitterImage || analysis.ogImage ? (
                  <img 
                    src={analysis.twitterImage || analysis.ogImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={analysis.twitterImage || analysis.ogImage ? "hidden" : ""}>
                  <Image className="text-white text-2xl opacity-50" size={32} />
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs text-muted-foreground mb-1">{domain}</div>
                <h5 className="text-sm font-medium text-foreground mb-1">
                  {analysis.twitterTitle || analysis.title || "No title"}
                </h5>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {analysis.twitterDescription || analysis.metaDescription || "No description"}
                </p>
              </div>
            </div>
          </div>

          {/* Facebook Card */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
              <Facebook className="text-blue-500 mr-2" size={16} />
              Facebook Preview
            </h4>
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {analysis.ogImage ? (
                  <img 
                    src={analysis.ogImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={analysis.ogImage ? "hidden" : ""}>
                  <Image className="text-white text-2xl opacity-50" size={32} />
                </div>
              </div>
              <div className="p-3">
                <h5 className="text-sm font-medium text-foreground mb-1">
                  {analysis.ogTitle || analysis.title || "No title"}
                </h5>
                <p className="text-xs text-muted-foreground mb-2">
                  {analysis.ogDescription || analysis.metaDescription || "No description"}
                </p>
                <div className="text-xs text-muted-foreground uppercase">{domain}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
