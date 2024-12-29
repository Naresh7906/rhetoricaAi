import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, LayoutGrid, List, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { allCoursesService, type AllCourse } from "@/services/allCoursesService";
import { cn } from "@/lib/utils";

// Category icons mapping
const categoryIcons: { [key: string]: string } = {
  "Vocabulary": "📚",
  "Communication": "💬",
  "Leadership": "👥",
  "Productivity": "⚡",
  "Professional Development": "📈",
  "Teamwork": "🤝",
  "Business Skills": "💼",
  "Career Development": "🎯",
  "Personal Development": "🌱",
  "Innovation": "💡",
  "Customer Relations": "🤝",
};

export function AllCoursesPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'tile'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [courses, setCourses] = useState<AllCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await allCoursesService.getAllCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filterCourses = (courses: AllCourse[]) => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const uniqueCategories = Array.from(new Set(courses.map(course => course.category)));

  const scrollCategories = (direction: 'left' | 'right') => {
    const container = document.getElementById('categories-container');
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, categoryScrollPosition - scrollAmount)
        : categoryScrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setCategoryScrollPosition(newPosition);
    }
  };

  const CategoryCard = ({ category }: { category: string }) => (
    <Card
      className={cn(
        "flex-shrink-0 w-[200px] p-4 cursor-pointer hover:shadow-lg transition-all",
        categoryFilter === category && "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
      )}
      onClick={() => setCategoryFilter(category === categoryFilter ? 'all' : category)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-2xl">{categoryIcons[category] || '📋'}</span>
        <h3 className="font-medium text-sm">{category}</h3>
        <p className="text-xs text-muted-foreground">
          {courses.filter(course => course.category === category).length} courses
        </p>
      </div>
    </Card>
  );

  const CourseCard = ({ course }: { course: AllCourse }) => (
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
          alt={course.title}
          className={viewMode === 'card' ? 'w-16 h-16 rounded-lg object-cover' : 'w-12 h-12 rounded-lg object-cover'}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-semibold group-hover:text-purple-600 ${viewMode === 'card' ? 'text-lg' : 'text-base'}`}>
                {course.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className={viewMode === 'card' ? 'w-6 h-6' : 'w-5 h-5'}>
                  <AvatarFallback>{course.author.name[0]}</AvatarFallback>
                </Avatar>
                <p className={`text-muted-foreground ${viewMode === 'card' ? 'text-sm' : 'text-xs'}`}>
                  {course.author.name}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded bg-purple-100 text-purple-600 dark:bg-purple-900/50 ${
              viewMode === 'card' ? 'text-sm' : 'text-xs'
            }`}>
              {course.category}
            </span>
          </div>
          {viewMode === 'card' && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" className="gap-1">
                  View Course <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className={viewMode === 'card' ? 'p-4' : 'p-3'}>
      <div className={`flex items-center ${viewMode === 'card' ? 'gap-4' : 'gap-2'}`}>
        <Skeleton className={viewMode === 'card' ? 'w-16 h-16 rounded-lg' : 'w-12 h-12 rounded-lg'} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          {viewMode === 'card' && (
            <div className="mt-4 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-32" />
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content with padding to account for fixed header and filters */}
        <div className="pt-[160px] mt-6 p-6 space-y-8">
          {/* Categories Carousel */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollCategories('left')}
                disabled={categoryScrollPosition === 0}
                className="h-8 w-8 rounded-full bg-background shadow-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div 
              id="categories-container"
              className="flex gap-4 overflow-x-hidden scroll-smooth px-8"
            >
              {loading ? (
                Array(6).fill(0).map((_, index) => (
                  <Skeleton key={index} className="flex-shrink-0 w-[200px] h-[100px] rounded-lg" />
                ))
              ) : (
                uniqueCategories.map(category => (
                  <CategoryCard key={category} category={category} />
                ))
              )}
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollCategories('right')}
                className="h-8 w-8 rounded-full bg-background shadow-md"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* All Courses Grid */}
          <div className={viewMode === 'card' ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
            {loading ? (
              Array(6).fill(0).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))
            ) : (
              filterCourses(courses).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 