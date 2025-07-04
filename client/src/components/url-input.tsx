import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Globe } from "lucide-react";

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onAnalyze, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("https://example.com");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && isValidURL(url)) {
      onAnalyze(url);
    }
  };

  const isValidURL = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="mb-8">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="url-input" className="text-sm font-medium text-muted-foreground mb-2 block">
                Website URL
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                type="submit"
                disabled={isLoading || !url || !isValidURL(url)}
                className="min-w-[120px]"
              >
                <Search size={16} className="mr-2" />
                {isLoading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
