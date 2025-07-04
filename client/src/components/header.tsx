import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { Moon, Sun, FileText, User, Search } from "lucide-react";
import { auth, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface HeaderProps {
  onExportPDF: () => void;
}

export function Header({ onExportPDF }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [user] = useAuthState(auth);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleAuth = async () => {
    if (!auth) {
      alert("Authentication is not configured. Please provide Firebase credentials.");
      return;
    }
    
    if (user) {
      await signOutUser();
    } else {
      await signInWithGoogle();
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Search className="text-primary-foreground" size={16} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MetaScope</h1>
              <p className="text-sm text-muted-foreground">SEO Meta Tag Analyzer</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            
            <Button
              variant="outline"
              onClick={onExportPDF}
              className="hidden sm:flex"
            >
              <FileText size={16} className="mr-2" />
              Export as PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={onExportPDF}
              size="icon"
              className="sm:hidden"
            >
              <FileText size={16} />
            </Button>
            
            <Button onClick={handleAuth}>
              <User size={16} className="mr-2" />
              {user ? 'Sign Out' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
