import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { employeeService } from "@/services/employeeService";
import { EmployeeProfile, Course, StatItem } from "@/types/employee";
import {
  BookOpen,
  Award,
  Clock,
  Trophy,
  Mail,
  Bell,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/layout/sidebar";
import { WelcomeSection } from "@/components/dashboard/welcome-section";

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [mainProgramCourses, setMainProgramCourses] = useState<Course[]>([]);
  const [learningPathCourses, setLearningPathCourses] = useState<Course[]>([]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, mainProgram, learningPath] = await Promise.all([
          employeeService.getEmployeeProfile(),
          employeeService.getMainProgramCourses(),
          employeeService.getLearningPathCourses(),
        ]);
        setProfile(profileData);
        setMainProgramCourses(mainProgram);
        setLearningPathCourses(learningPath);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats: StatItem[] = profile ? [
    { label: "Completed Courses", value: profile.stats.completed_courses.toString(), icon: BookOpen, color: "bg-yellow-500" },
    { label: "Average Score", value: `${profile.stats.average_score}%`, icon: Trophy, color: "bg-purple-600" },
    { label: "Certificates", value: profile.stats.certifications.toString(), icon: Award, color: "bg-pink-500" },
    { label: "Learning Hours", value: profile.stats.learning_hours.toString(), icon: Clock, color: "bg-purple-300" },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
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
            {loading ? (
              <Skeleton className="w-8 h-8 rounded-full" />
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar} alt={profile?.name} />
                  <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{profile?.name}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content with padding to account for fixed header */}
        <div className="pt-[100px] mt-6 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <WelcomeSection 
              loading={loading} 
              userName={profile?.name} 
              mainProgramCourses={mainProgramCourses}
            />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <Card key={index} className="p-4">
                  <Skeleton className="h-16 w-full" />
                </Card>
              ))
            ) : (
              stats.map((stat, index) => (
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
              ))
            )}
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
              {loading ? (
                Array(2).fill(0).map((_, index) => (
                  <Card key={index} className="p-4">
                    <Skeleton className="h-32 w-full" />
                  </Card>
                ))
              ) : (
                learningPathCourses.slice(0, 3).map((course: Course) => (
                  <Card
                    key={course.id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/employee/courses/${course.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={course.avatar}
                        alt={course.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold group-hover:text-purple-600">{course.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback>{course.author[0]}</AvatarFallback>
                              </Avatar>
                              <p className="text-sm text-muted-foreground">{course.author}</p>
                            </div>
                          </div>
                          <span className={`text-sm px-2 py-1 rounded ${
                            course.status === 'completed'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/50'
                              : course.status === 'in_progress'
                              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                          }`}>
                            {course.status.replace('_', ' ').charAt(0).toUpperCase() + course.status.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Progress</span>
                          </div>
                          <Progress 
                            value={course.status === 'completed' ? 100 : course.status === 'in_progress' ? 50 : 0} 
                            className="h-2" 
                          />
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-600 dark:text-purple-400">
                              {course.status === 'completed' ? '100' : course.status === 'in_progress' ? '50' : '0'}% Complete
                            </span>
                            <Button variant="ghost" size="sm" className="gap-1">
                              {course.status === 'completed' ? 'Review' : 'Continue Learning'} <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 