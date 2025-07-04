import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type AiSuggestion } from "@shared/schema";
import { Bot, Copy, Check } from "lucide-react";
import { useState } from "react";

interface AiSuggestionsProps {
  suggestions: AiSuggestion[];
  isLoading: boolean;
}

export function AiSuggestions({ suggestions, isLoading }: AiSuggestionsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Bot className="text-primary" size={16} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">AI-Generated Suggestions</h3>
            </div>
            <Badge variant="outline" className="text-xs">
              Powered by Hugging Face
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions.length) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Bot className="text-primary" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">AI-Generated Suggestions</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            Powered by Hugging Face
          </Badge>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-card/50 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">{suggestion.title}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(suggestion.content, index)}
                >
                  {copiedIndex === index ? (
                    <Check size={12} className="mr-1" />
                  ) : (
                    <Copy size={12} className="mr-1" />
                  )}
                  {copiedIndex === index ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-sm text-foreground bg-background/50 p-3 rounded border">
                {suggestion.content}
              </p>
              {suggestion.characterCount && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Character count: {suggestion.characterCount} 
                  {suggestion.type === 'description' && (
                    <span className={suggestion.characterCount >= 120 && suggestion.characterCount <= 160 ? "text-emerald-400" : "text-amber-400"}>
                      {suggestion.characterCount >= 120 && suggestion.characterCount <= 160 ? " (optimal for SEO)" : " (consider adjusting length)"}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
