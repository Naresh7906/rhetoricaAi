import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Users,
  FileText,
  GraduationCap,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Overview } from "@/components/dashboard/overview";
import { EmployeeList } from "@/components/dashboard/employee-list";
import { TrainingPrograms } from "@/components/dashboard/training-programs";
import { Reports } from "@/components/dashboard/reports";

export function HRDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    navigate("/hr/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text">Rhetorica.AI</h1>
            <span className="ml-2 text-sm text-muted-foreground">HR Admin</span>
          </div>
          <nav className="flex items-center space-x-4 ml-8">
            <Link
              to="/hr/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Overview
            </Link>
            <Link
              to="/hr/employees"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Employees
            </Link>
            <Link
              to="/hr/training"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Training
            </Link>
            <Link
              to="/hr/reports"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Reports
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
              className="hover:text-primary"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="employees/*" element={<EmployeeList />} />
          <Route path="training/*" element={<TrainingPrograms />} />
          <Route path="reports/*" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
} 