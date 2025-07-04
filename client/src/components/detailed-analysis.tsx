import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type SeoAnalysisResponse } from "@shared/schema";
import { Settings, FileText, Share2, CheckCircle, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

interface DetailedAnalysisProps {
  analysis: SeoAnalysisResponse | null;
  isLoading: boolean;
}

export function DetailedAnalysis({ analysis, isLoading }: DetailedAnalysisProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Detailed Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const failedItems = analysis.auditResults.filter(item => item.status === "fail");
  const warnItems = analysis.auditResults.filter(item => item.status === "warn");

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Detailed Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Technical SEO */}
          <div className="bg-card/30 rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="text-blue-400" size={16} />
              <h4 className="font-medium text-foreground">Technical SEO</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">HTTPS</span>
                <span className={`flex items-center ${analysis.technicalSeo.hasHttps ? 'text-emerald-400' : 'text-red-400'}`}>
                  {analysis.technicalSeo.hasHttps ? <CheckCircle className="mr-1" size={12} /> : <AlertTriangle className="mr-1" size={12} />}
                  {analysis.technicalSeo.hasHttps ? 'Secure' : 'Insecure'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile Friendly</span>
                <span className={`flex items-center ${analysis.technicalSeo.isMobileFriendly ? 'text-emerald-400' : 'text-red-400'}`}>
                  {analysis.technicalSeo.isMobileFriendly ? <CheckCircle className="mr-1" size={12} /> : <AlertTriangle className="mr-1" size={12} />}
                  {analysis.technicalSeo.isMobileFriendly ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page Speed</span>
                <span className="text-emerald-400 flex items-center">
                  <CheckCircle className="mr-1" size={12} />
                  {analysis.technicalSeo.pageSpeed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Robots.txt</span>
                <span className={`flex items-center ${analysis.technicalSeo.hasRobotsTxt ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {analysis.technicalSeo.hasRobotsTxt ? <CheckCircle className="mr-1" size={12} /> : <AlertTriangle className="mr-1" size={12} />}
                  {analysis.technicalSeo.hasRobotsTxt ? 'Found' : 'Check needed'}
                </span>
              </div>
            </div>
          </div>

          {/* Content Analysis */}
          <div className="bg-card/30 rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="text-green-400" size={16} />
              <h4 className="font-medium text-foreground">Content Quality</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Word Count</span>
                <span className="text-foreground">{analysis.contentAnalysis.wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Headings Structure</span>
                <span className={`flex items-center ${analysis.contentAnalysis.headingStructure ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {analysis.contentAnalysis.headingStructure ? <CheckCircle className="mr-1" size={12} /> : <AlertTriangle className="mr-1" size={12} />}
                  {analysis.contentAnalysis.headingStructure ? 'Proper' : 'Needs work'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Images with Alt</span>
                <span className={`flex items-center ${analysis.contentAnalysis.missingAltCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {analysis.contentAnalysis.missingAltCount === 0 ? <CheckCircle className="mr-1" size={12} /> : <AlertTriangle className="mr-1" size={12} />}
                  {analysis.contentAnalysis.missingAltCount === 0 ? 'All covered' : `${analysis.contentAnalysis.missingAltCount} missing`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Internal Links</span>
                <span className="text-foreground">{analysis.contentAnalysis.internalLinks} found</span>
              </div>
            </div>
          </div>

          {/* SEO Summary */}
          <div className="bg-card/30 rounded-lg p-4 border">
            <div className="flex items-center space-x-2 mb-4">
              <Share2 className="text-purple-400" size={16} />
              <h4 className="font-medium text-foreground">SEO Summary</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Score</span>
                <span className="text-foreground font-medium">{analysis.seoScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passed Tests</span>
                <span className="text-emerald-400">{analysis.auditResults.filter(r => r.status === 'pass').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Warnings</span>
                <span className="text-amber-400">{warnItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Failed Tests</span>
                <span className="text-red-400">{failedItems.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        {(failedItems.length > 0 || warnItems.length > 0) && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-foreground mb-3 flex items-center">
              <Lightbulb className="text-primary mr-2" size={16} />
              Priority Action Items
            </h4>
            <ul className="space-y-2 text-sm">
              {failedItems.slice(0, 3).map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-foreground">{item.description}</span>
                </li>
              ))}
              {warnItems.slice(0, 2).map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-foreground">{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
