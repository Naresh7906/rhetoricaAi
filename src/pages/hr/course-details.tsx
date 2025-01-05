import { useParams } from "react-router-dom";
import allCoursesData from "@/templates/allcources.json";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Clock,
  GraduationCap,
  FileText,
  User,
  Video,
  CheckCircle2,
} from "lucide-react";
import { Course } from "@/types/course";

interface HRCourseDetailsProps {
  previewData?: Course;
}

export function HRCourseDetails({ previewData }: HRCourseDetailsProps) {
  const { courseId } = useParams();
  const course = previewData || allCoursesData.courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const totalDuration = course.chapters.reduce((total, chapter) => {
    const minutes = parseInt(chapter.duration.split(' ')[0]);
    return total + minutes;
  }, 0);

  const totalQuizzes = course.chapters.filter(ch => ch.hasQuiz).length;
  const totalResources = course.chapters.reduce((total, chapter) => total + chapter.resources.length, 0);

  return (
    <div className="mx-auto p-6">
      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 w-full">
        <div className="lg:col-span-2">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{course.category}</Badge>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{totalDuration} minutes</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
        </div>

        {/* Course Image */}
        <div className="relative h-48 lg:h-auto rounded-lg overflow-hidden">
          <img
            src={course.avatar}
            alt={course.title}
            className="w-40 h-40 object-cover"
          />
        </div>
      </div>

      {/* Course Stats and Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Author Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Instructor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <img
                src={course.author.avatar}
                alt={course.author.name}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <div className="font-medium">{course.author.name}</div>
                <div className="text-sm text-muted-foreground">{course.author.role}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Stats */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Chapters</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{course.chapters.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{totalQuizzes}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{totalResources}</span>
          </CardContent>
        </Card>
      </div>

      {/* Course Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            {course.chapters.length} chapters • {totalDuration} minutes total length
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {course.chapters.map((chapter, index) => (
              <AccordionItem key={chapter.id} value={`chapter-${chapter.id}`}>
                <AccordionTrigger>
                  <div className="flex items-center space-x-3">
                    <span className="text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{chapter.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-9">
                    {/* Video Section */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>Video Lecture</span>
                      </div>
                      <span className="text-muted-foreground">{chapter.duration}</span>
                    </div>

                    {/* Resources */}
                    {chapter.resources.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Resources:</div>
                        {chapter.resources.map((resource, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center space-x-2 text-sm text-muted-foreground"
                          >
                            <FileText className="h-4 w-4" />
                            <span>{resource}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quiz Indicator */}
                    {chapter.hasQuiz && (
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Includes quiz</span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
} 