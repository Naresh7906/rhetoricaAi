import { useNavigate, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Clock,
  Trophy,
  Mail,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data
const stats = [
  { label: "Completed Courses", value: "12", icon: BookOpen, color: "bg-yellow-500" },
  { label: "Average Score", value: "85%", icon: Trophy, color: "bg-purple-600" },
  { label: "Certificates", value: "3", icon: Award, color: "bg-pink-500" },
  { label: "Learning Hours", value: "45", icon: Clock, color: "bg-purple-300" },
];

const assignedCourses = [
  {
    id: "web-design-101",
    title: "Masterclass: Designing for Web",
    description: "Master effective communication in a corporate environment",
    progress: 65,
    dueDate: "2024-04-15",
    type: "Required",
    thumbnail: "/course-comm.jpg",
    instructor: {
      name: "Natalia Storm",
      role: "Design Department",
      avatar: "/instructor-avatar.jpg"
    }
  },
  {
    id: "leadership-fundamentals",
    title: "Leadership Fundamentals",
    description: "Develop essential leadership and management skills",
    progress: 30,
    dueDate: "2024-05-01",
    type: "Optional",
    thumbnail: "/course-lead.jpg",
    instructor: {
      name: "Michael Chen",
      role: "Leadership Coach",
      avatar: "/instructor2-avatar.jpg"
    }
  }
];

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-[240px] p-4 border-r bg-card">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
            R
          </div>
          <span className="text-xl font-semibold">Rhetorica.AI</span>
        </div>

        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/employee/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/employee/courses">
              <BookOpen className="w-4 h-4" />
              My Courses
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/employee/certificates">
              <Award className="w-4 h-4" />
              Certificates
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/employee/profile">
              <User className="w-4 h-4" />
              Profile
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link to="/employee/settings">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/employee/login")}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-[240px] h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Header */}
        <header className="fixed top-0 right-0 left-[240px] bg-background z-50 p-6 flex items-center justify-between border-b">
          <div>
            <h1 className="text-2xl font-semibold">Learning Dashboard</h1>
            <p className="text-muted-foreground">{currentDate}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Mail className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/avatar.jpg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">John Doe</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content with padding to account for fixed header */}
        <div className="pt-[100px] p-6">
          {/* Welcome Section */}
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-8 mb-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Welcome back, John!</h2>
                <p className="text-muted-foreground">Continue your learning journey with Rhetorica.AI</p>
              </div>
              <img
                src="/learning-illustration.svg"
                alt="Learning Illustration"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Assigned Courses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Your Learning Path</h3>
              <Button onClick={() => navigate("/employee/courses")}>
                <GraduationCap className="w-4 h-4 mr-2" />
                View All Courses
              </Button>
            </div>

            <div className="space-y-4">
              {assignedCourses.map((course) => (
                <Card
                  key={course.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/employee/courses/${course.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold group-hover:text-purple-600">{course.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={course.instructor.avatar} />
                              <AvatarFallback>{course.instructor.name[0]}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm text-muted-foreground">{course.instructor.name}</p>
                          </div>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${course.type === 'Required'
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                          }`}>
                          {course.type}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span>Due: {course.dueDate}</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-600 dark:text-purple-400">{course.progress}% Complete</span>
                          <Button variant="ghost" size="sm" className="gap-1">
                            Continue Learning <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 