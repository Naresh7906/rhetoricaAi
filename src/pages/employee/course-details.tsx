import { Link, useParams } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ChevronRight,
  Home,
  Play,
  MessageSquare,
  Clock,
  BookOpen,
  Download,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

// Mock course data
const courseData = {
  id: "web-design-101",
  title: "Masterclass: Designing for Web",
  instructor: {
    name: "Natalia Storm",
    role: "Design Department",
    avatar: "/instructor-avatar.jpg"
  },
  progress: 65,
  chapters: [
    {
      id: 1,
      title: "What is Interaction Design?",
      completed: true,
      duration: "15 min"
    },
    {
      id: 2,
      title: "Motion in UI Design",
      completed: true,
      duration: "20 min"
    },
    {
      id: 3,
      title: "Fundamentals of Web Design",
      completed: false,
      duration: "25 min",
      current: true
    },
    {
      id: 4,
      title: "Improving Visual Skills",
      completed: false,
      duration: "30 min"
    },
    {
      id: 5,
      title: "Finding Inspiration",
      completed: false,
      duration: "20 min"
    }
  ],
  discussions: [
    {
      id: 1,
      user: {
        name: "Robin Gorbachev",
        avatar: "/user1-avatar.jpg"
      },
      message: "Cool stuff! I'm wondering where I can find the list of recommended resources...",
      time: "5min",
      replies: 3
    },
    {
      id: 2,
      user: {
        name: "Jason Graham",
        avatar: "/user2-avatar.jpg"
      },
      message: "The new examples really helped clarify the concepts!",
      time: "2:36",
      replies: 1
    }
  ]
};

export function CourseDetails() {
  const { courseId } = useParams();
  const currentChapter = courseData.chapters.find(chapter => chapter.current);

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
            <span className="text-foreground">{courseData.title}</span>
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
              <h1 className="text-3xl font-bold mb-4">{courseData.title}</h1>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={courseData.instructor.avatar} />
                  <AvatarFallback>NS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{courseData.instructor.name}</p>
                  <p className="text-sm text-muted-foreground">{courseData.instructor.role}</p>
                </div>
              </div>
            </div>

            {/* Current Chapter */}
            <Card className="p-8">
              <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" /> Continue Learning
                </Button>
              </div>
              <h2 className="text-2xl font-semibold mb-4">
                Chapter {currentChapter?.id}: {currentChapter?.title}
              </h2>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                Hi guys, Natalia here with a very unconventional method that will get 
                you thinking online courses into this awesome course. As you might be 
                already knowing, web development is the next biggest thing that is 
                going to revolutionize the world.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Download className="w-4 h-4" /> Resources
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Star className="w-4 h-4" /> Quiz
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Duration: {currentChapter?.duration}
                </div>
              </div>
            </Card>

            {/* Discussion Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Discussion</h3>
              <div className="space-y-4">
                {courseData.discussions.map(discussion => (
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
              <Progress value={courseData.progress} className="mb-3" />
              <p className="text-sm text-muted-foreground">
                {courseData.progress}% Completed
              </p>
            </Card>

            {/* Chapters List */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{courseData.title}</h3>
              <div className="space-y-3">
                {courseData.chapters.map(chapter => (
                  <div
                    key={chapter.id}
                    className={`p-4 rounded-lg flex items-center gap-4 ${
                      chapter.current 
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/30' 
                        : 'hover:bg-muted/50 cursor-pointer'
                    }`}
                  >
                    {chapter.completed ? (
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        ✓
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        chapter.current 
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
          </div>
        </div>
      </div>
    </div>
  );
} 