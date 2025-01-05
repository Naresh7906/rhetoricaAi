import { useState } from "react";
import { useNavigate } from "react-router-dom";
import allCoursesData from "@/templates/allcources.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  GraduationCap,
  Clock,
  BookOpen,
  User,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Course {
  id: string;
  title: string;
  avatar: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  description: string;
  chapters: Array<{
    id: number;
    title: string;
    duration: string;
    videoUrl: string;
    resources: string[];
    hasQuiz: boolean;
  }>;
}

type SortField = 'title' | 'category' | 'duration' | 'chapters';
type SortOrder = 'asc' | 'desc';

export function CoursesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Get unique categories
  const categories = Array.from(
    new Set(allCoursesData.courses.map((course) => course.category))
  );

  // Calculate total duration for a course
  const getTotalDuration = (chapters: Course['chapters']) => {
    return chapters.reduce((total, chapter) => {
      const minutes = parseInt(chapter.duration.split(' ')[0]);
      return total + minutes;
    }, 0);
  };

  // Filter courses based on search and category
  const filteredCourses = allCoursesData.courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'duration':
        comparison = getTotalDuration(a.chapters) - getTotalDuration(b.chapters);
        break;
      case 'chapters':
        comparison = a.chapters.length - b.chapters.length;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Add Create Course Button */}
        <Button
          onClick={() => navigate('/hr/courses/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Courses Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-2">
                  <span>Course</span>
                  <SortIcon field="title" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center space-x-2">
                  <span>Category</span>
                  <SortIcon field="category" />
                </div>
              </TableHead>
              <TableHead>Author</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center space-x-2">
                  <span>Duration</span>
                  <SortIcon field="duration" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('chapters')}
              >
                <div className="flex items-center space-x-2">
                  <span>Chapters</span>
                  <SortIcon field="chapters" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={course.avatar} 
                      alt={course.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {course.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {course.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={course.author.avatar} 
                      alt={course.author.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium">{course.author.name}</div>
                      <div className="text-xs text-muted-foreground">{course.author.role}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{getTotalDuration(course.chapters)} min</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{course.chapters.length} chapters</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>{course.chapters.filter(ch => ch.hasQuiz).length} quizzes</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/hr/courses/${course.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {sortedCourses.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
} 