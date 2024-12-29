import { useState, useEffect } from "react";
import { employeeService } from "@/services/employeeService";
import { Course } from "@/types/employee";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function CoursesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mainProgramCourses, setMainProgramCourses] = useState<Course[]>([]);
  const [learningPathCourses, setLearningPathCourses] = useState<Course[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'tile'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const [mainProgram, learningPath] = await Promise.all([
          employeeService.getMainProgramCourses(),
          employeeService.getLearningPathCourses(),
        ]);
        setMainProgramCourses(mainProgram);
        setLearningPathCourses(learningPath);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filterCourses = (courses: Course[]) => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card
      key={course.id}
      className={`hover:shadow-lg transition-shadow cursor-pointer ${
        viewMode === 'card' ? 'p-4' : 'p-3'
      }`}
      onClick={() => navigate(`/employee/courses/${course.id}`)}
    >
      <div className={`flex items-center ${viewMode === 'card' ? 'gap-4' : 'gap-2'}`}>
        <img
          src={course.avatar}
          alt={course.name}
          className={viewMode === 'card' ? 'w-16 h-16 rounded-lg object-cover' : 'w-12 h-12 rounded-lg object-cover'}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-semibold group-hover:text-purple-600 ${viewMode === 'card' ? 'text-lg' : 'text-base'}`}>
                {course.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className={viewMode === 'card' ? 'w-6 h-6' : 'w-5 h-5'}>
                  <AvatarFallback>{course.author[0]}</AvatarFallback>
                </Avatar>
                <p className={`text-muted-foreground ${viewMode === 'card' ? 'text-sm' : 'text-xs'}`}>
                  {course.author}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded ${
              course.status === 'completed'
                ? 'bg-green-100 text-green-600 dark:bg-green-900/50'
                : course.status === 'in_progress'
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
            } ${viewMode === 'card' ? 'text-sm' : 'text-xs'}`}>
              {course.status.replace('_', ' ').charAt(0).toUpperCase() + course.status.slice(1).replace('_', ' ')}
            </span>
          </div>
          {viewMode === 'card' && (
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
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-[240px] h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Header */}
        <header className="fixed top-0 right-0 left-[240px] bg-background z-50 p-6 flex items-center justify-between border-b">
          <h1 className="text-2xl font-semibold">All Courses</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'card' ? 'tile' : 'card')}
            >
              {viewMode === 'card' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="fixed top-[73px] right-0 left-[240px] bg-background z-40 p-6 border-b">
          <div className="flex gap-4">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content with padding to account for fixed header and filters */}
        <div className="pt-[160px] mt-6 p-6 space-y-8">
          {/* Main Program Courses */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Main Program</h2>
            <div className={`${viewMode === 'card' ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
              {loading ? (
                Array(4).fill(0).map((_, index) => (
                  <Card key={index} className="p-4">
                    <Skeleton className="h-32 w-full" />
                  </Card>
                ))
              ) : (
                filterCourses(mainProgramCourses).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))
              )}
            </div>
          </div>

          {/* Learning Path Courses */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Learning Path</h2>
            <div className={`${viewMode === 'card' ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
              {loading ? (
                Array(4).fill(0).map((_, index) => (
                  <Card key={index} className="p-4">
                    <Skeleton className="h-32 w-full" />
                  </Card>
                ))
              ) : (
                filterCourses(learningPathCourses).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 