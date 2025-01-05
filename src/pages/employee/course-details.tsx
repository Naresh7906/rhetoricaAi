import { Link, useParams, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import YouTube from 'react-youtube';
import {
  ChevronRight,
  Home,
  Play,
  MessageSquare,
  Clock,
  Download,
  Star,
  Mic,
  BookOpen,
  Timer,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getCourseById } from "@/services/courseService";
import { allCoursesService } from "@/services/allCoursesService";
import { useEffect, useState } from "react";
import type { Course } from "@/services/courseService";
import type { AllCourse } from "@/services/allCoursesService";
import { CourseDetailsSkeleton } from "@/components/skeletons/course-details-skeleton";
import { RhetoricaChatPopup } from "@/components/rhetorica/RhetoricaChatPopup";

// Utility function to extract YouTube video ID
const getYouTubeVideoId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
};

export function CourseDetails() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | undefined>();
  const [allCourse, setAllCourse] = useState<AllCourse | undefined>();
  const [currentChapter, setCurrentChapter] = useState<Course["chapters"][0] | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        setIsLoading(true);
        try {
          // First try to get from enrolled courses
          const courseData = await getCourseById(courseId);
          if (courseData) {
            setCourse(courseData);
            const inProgressChapter = courseData.chapters.find((_, index) => 
              (index / courseData.chapters.length) * 100 > courseData.progress
            );
            setCurrentChapter(inProgressChapter || courseData.chapters[0]);
          } else {
            // If not found in enrolled courses, fetch from all courses
            const allCourses = await allCoursesService.getAllCourses();
            const foundCourse = allCourses.find(c => c.id === courseId);
            setAllCourse(foundCourse);
          }
        } catch (error) {
          console.error('Error fetching course:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleStartTest = () => {
    navigate(`/employee/voice-test/${courseId}`);
  };

  const handleEnrollCourse = () => {
    // TODO: Implement enrollment logic
    console.log('Enrolling in course:', courseId);
  };

  if (isLoading) {
    return <CourseDetailsSkeleton />;
  }

  if (!course && !allCourse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Course not found</p>
      </div>
    );
  }

  // Registration UI for non-enrolled course
  if (allCourse) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/employee/dashboard" className="hover:text-foreground">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/employee/courses" className="hover:text-foreground">Courses</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{allCourse.title}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="w-full mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Course Header */}
              <div>
                <h1 className="text-3xl font-bold mb-4">{allCourse.title}</h1>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={allCourse.author.avatar} />
                    <AvatarFallback>{allCourse.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{allCourse.author.name}</p>
                    <p className="text-sm text-muted-foreground">{allCourse.author.role}</p>
                  </div>
                </div>
              </div>

              {/* Course Overview */}
              <Card className="p-8">
                <div className="aspect-video bg-muted rounded-lg mb-6 relative overflow-hidden">
                  {allCourse.chapters[0]?.videoUrl && getYouTubeVideoId(allCourse.chapters[0].videoUrl) ? (
                    <YouTube
                      videoId={getYouTubeVideoId(allCourse.chapters[0].videoUrl)!}
                      opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                          autoplay: 0,
                        },
                      }}
                      className="w-full aspect-video"
                    />
                  ) : (
                    <>
                      <img 
                        src={allCourse.avatar} 
                        alt={allCourse.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Button size="lg" className="gap-2" onClick={handleEnrollCourse}>
                          <BookOpen className="w-5 h-5" /> Enroll Now
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <h2 className="text-2xl font-semibold mb-4">Course Overview</h2>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  {allCourse.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Chapters</p>
                        <p className="text-2xl font-bold">{allCourse.chapters.length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Timer className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Total Duration</p>
                        <p className="text-2xl font-bold">
                          {allCourse.chapters.reduce((acc, chapter) => {
                            const duration = parseInt(chapter.duration);
                            return acc + (isNaN(duration) ? 0 : duration);
                          }, 0)} min
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Category</p>
                        <p className="text-2xl font-bold">{allCourse.category}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>

              {/* Course Content Preview */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6">Course Content</h3>
                <div className="space-y-3">
                  {allCourse.chapters.map(chapter => (
                    <div
                      key={chapter.id}
                      className="p-4 rounded-lg border hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{chapter.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="w-4 h-4" />
                            {chapter.duration}
                          </div>
                        </div>
                        <div className="text-sm text-purple-600">
                          {chapter.resources.length} resources
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <Card className="p-6 sticky top-24">
                <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Join this comprehensive course and master new skills!
                    </p>
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    size="lg"
                    onClick={handleEnrollCourse}
                  >
                    Enroll Now
                  </Button>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-600 flex items-center justify-center">✓</div>
                      Full course access
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-600 flex items-center justify-center">✓</div>
                      Downloadable resources
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-600 flex items-center justify-center">✓</div>
                      Certificate upon completion
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
        <RhetoricaChatPopup allCourse={allCourse} />
      </div>
    );
  }

  // Regular enrolled course UI
  if (course) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/employee/dashboard" className="hover:text-foreground">
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/employee/courses" className="hover:text-foreground">Courses</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{course.title}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="w-full mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* Course Header */}
              <div>
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={course.author.avatar} />
                    <AvatarFallback>{course.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{course.author.name}</p>
                    <p className="text-sm text-muted-foreground">{course.author.role}</p>
                  </div>
                </div>
              </div>

              {/* Current Chapter */}
              {currentChapter && (
                <Card className="p-8">
                  <div className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden">
                    {currentChapter.videoUrl && getYouTubeVideoId(currentChapter.videoUrl) ? (
                      <YouTube
                        videoId={getYouTubeVideoId(currentChapter.videoUrl)!}
                        opts={{
                          width: '100%',
                          height: '100%',
                          playerVars: {
                            autoplay: 0,
                          },
                        }}
                        className="w-full aspect-video"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Button size="lg" className="gap-2">
                          <Play className="w-5 h-5" /> Continue Learning
                        </Button>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">
                    Chapter {currentChapter.id}: {currentChapter.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="lg" className="gap-2">
                        <Download className="w-4 h-4" /> Resources
                      </Button>
                      {currentChapter.hasQuiz && (
                        <Button variant="outline" size="lg" className="gap-2">
                          <Star className="w-4 h-4" /> Quiz
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Duration: {currentChapter.duration}
                    </div>
                  </div>
                </Card>
              )}

              {/* Discussion Section */}
              <div>
                <h3 className="text-xl font-semibold mb-6">Discussion</h3>
                <div className="space-y-4">
                  {course.discussions.map(discussion => (
                    <Card key={discussion.id} className="p-6">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={discussion.user.avatar} />
                          <AvatarFallback>{discussion.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{discussion.user.name}</span>
                            <span className="text-sm text-muted-foreground">{discussion.time}</span>
                          </div>
                          <p className="text-base mb-3">{discussion.message}</p>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            {discussion.replies} replies
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Progress Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
                <Progress value={course.progress} className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  {course.progress}% Completed
                </p>
              </Card>

              {/* Chapters List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{course.title}</h3>
                <div className="space-y-3">
                  {course.chapters.map(chapter => (
                    <div
                      key={chapter.id}
                      className={`p-4 rounded-lg flex items-center gap-4 ${
                        chapter.id === currentChapter?.id
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/30' 
                          : 'hover:bg-muted/50 cursor-pointer'
                      }`}
                      onClick={() => setCurrentChapter(chapter)}
                    >
                      {chapter.completed ? (
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center">
                          ✓
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          chapter.id === currentChapter?.id
                            ? 'border-purple-600' 
                            : 'border-muted-foreground'
                        }`} />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${chapter.completed ? 'line-through opacity-70' : ''}`}>
                          {chapter.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {chapter.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Simulation Button */}
              {course.category === "Leadership" && (
                <Card className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Practice Your Skills</h3>
                    <p className="text-sm text-muted-foreground">
                      Test your leadership skills in a simulated scenario.
                    </p>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 gap-2" 
                      size="lg"
                      onClick={handleStartTest}
                    >
                      <Mic className="w-4 h-4" /> Simulate Scenario
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
        <RhetoricaChatPopup course={course} />
      </div>
    );
  }

  return null; // Fallback return
} 