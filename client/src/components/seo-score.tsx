import { Card, CardContent } from "@/components/ui/card";

interface SeoScoreProps {
  score: number;
  isLoading: boolean;
}

export function SeoScore({ score, isLoading }: SeoScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">SEO Score</h3>
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-muted animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">SEO Score</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                stroke="hsl(var(--muted))" 
                strokeWidth="8" 
                fill="none"
              />
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                stroke="hsl(var(--primary))" 
                strokeWidth="8" 
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Performance</span>
            <span className={`font-medium ${getScoreColor(score)}`}>
              {getScoreStatus(score)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
