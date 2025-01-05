import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";

export function Sidebar() {
  const location = useLocation();
  const { logout } = useUser();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[240px] p-4 border-r bg-card">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
          R
        </div>
        <span className="text-xl font-semibold">Rhetorica</span>
      </div>

      <div className="space-y-2">
        <Button 
          variant={isActive("/employee/dashboard") ? "secondary" : "ghost"} 
          className="w-full justify-start gap-2" 
          asChild
        >
          <Link to="/employee/dashboard">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </Button>
        <Button 
          variant={isActive("/employee/courses") ? "secondary" : "ghost"} 
          className="w-full justify-start gap-2" 
          asChild
        >
          <Link to="/employee/courses">
            <BookOpen className="w-4 h-4" />
            My Courses
          </Link>
        </Button>
        <Button 
          variant={isActive("/employee/all-courses") ? "secondary" : "ghost"} 
          className="w-full justify-start gap-2" 
          asChild
        >
          <Link to="/employee/all-courses">
            <GraduationCap className="w-4 h-4" />
            All Courses
          </Link>
        </Button>
        <Button 
          variant={isActive("/rhetorica-test") ? "secondary" : "ghost"} 
          className="w-full justify-start gap-2" 
          asChild
        >
          <Link to="/rhetorica-test">
            <Mic className="w-4 h-4" />
            Rhetorica Test
          </Link>
        </Button>
        <Button 
          variant={isActive("/employee/profile") ? "secondary" : "ghost"} 
          className="w-full justify-start gap-2" 
          asChild
        >
          <Link to="/employee/profile">
            <User className="w-4 h-4" />
            Profile
          </Link>
        </Button>
        <Button 
          variant={isActive("/employee/settings") ? "secondary" : "ghost"} 
          className="w-full justify-start gap-2" 
          asChild
        >
          <Link to="/employee/settings">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
} 