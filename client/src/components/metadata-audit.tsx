import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type SeoAnalysisResponse } from "@shared/schema";
import { CheckCircle, AlertTriangle, XCircle, Wand2 } from "lucide-react";

interface MetadataAuditProps {
  analysis: SeoAnalysisResponse | null;
  isLoading: boolean;
  onGenerateTags: () => void;
}

export function MetadataAudit({ analysis, isLoading, onGenerateTags }: MetadataAuditProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Metadata Audit</h3>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="text-emerald-400" size={16} />;
      case "warn":
        return <AlertTriangle className="text-amber-400" size={16} />;
      case "fail":
        return <XCircle className="text-red-400" size={16} />;
      default:
        return <XCircle className="text-red-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "border-emerald-500/20 bg-emerald-500/5";
      case "warn":
        return "border-amber-500/20 bg-amber-500/5";
      case "fail":
        return "border-red-500/20 bg-red-500/5";
      default:
        return "border-red-500/20 bg-red-500/5";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pass":
        return "text-emerald-400";
      case "warn":
        return "text-amber-400";
      case "fail":
        return "text-red-400";
      default:
        return "text-red-400";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Metadata Audit</h3>
          <Button onClick={onGenerateTags}>
            <Wand2 size={16} className="mr-2" />
            Generate Missing Tags
          </Button>
        </div>

        <div className="space-y-4">
          {analysis.auditResults.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(item.status)}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.value && (
                    <div className={`mt-1 text-sm px-2 py-1 rounded inline-block bg-background/50 ${getStatusText(item.status)}`}>
                      {item.value}
                    </div>
                  )}
                  {item.suggestion && (
                    <button className="mt-2 text-sm text-primary hover:text-primary/80 underline">
                      {item.suggestion} →
                    </button>
                  )}
                </div>
              </div>
              <div className={`font-medium text-sm ${getStatusText(item.status)}`}>
                {item.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
