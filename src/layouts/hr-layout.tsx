import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Users,
  FileText,
  GraduationCap,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HRLayoutProps {
  children: React.ReactNode;
}

export function HRLayout({ children }: HRLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    navigate("/hr/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b">
        <div className="mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {/* Logo/Brand */}
              <h1 className="text-xl font-bold text-primary">Rhetorica HR</h1>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/hr/dashboard" className="text-foreground/60 hover:text-foreground flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/hr/employees" className="text-foreground/60 hover:text-foreground flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Employees</span>
                </Link>
                <Link to="/hr/courses" className="text-foreground/60 hover:text-foreground flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Courses</span>
                </Link>
                <Link to="/hr/reports" className="text-foreground/60 hover:text-foreground flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Reports</span>
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
} 