import { Skeleton } from "@/components/ui/skeleton";
import { Course } from "@/types/employee";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

interface WelcomeSectionProps {
  loading: boolean;
  userName?: string;
  mainProgramCourses?: Course[];
}

export function WelcomeSection({ loading, userName, mainProgramCourses = [] }: WelcomeSectionProps) {
  const currentCourseIndex = mainProgramCourses.findIndex(course => course.status === 'in_progress');
  const progressWidth = currentCourseIndex >= 0 
    ? `${((currentCourseIndex + 1) / mainProgramCourses.length) * 100}%`
    : '0%';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'in_progress':
        return <PlayCircle className="w-6 h-6" />;
      default:
        return <Circle className="w-6 h-6" />;
    }
  };

  const generatePath = () => {
    const numPoints = mainProgramCourses.length;
    if (numPoints < 2) return "";

    const width = 100; // width per segment
    const height = 24; // max curve height
    const smoothness = 0.4; // control point factor (0-1)
    let path = `M0,${height}`; // Start at the left

    for (let i = 0; i < numPoints - 1; i++) {
      const x1 = i * width;
      const x2 = (i + 1) * width;
      const y1 = height;
      const y2 = i % 2 === 0 ? 0 : height * 2;
      
      // Calculate control points for smoother curve
      const cp1x = x1 + (width * smoothness);
      const cp1y = y1;
      const cp2x = x2 - (width * smoothness);
      const cp2y = y2;
      
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }

    return path;
  };

  const pathDefinition = generatePath();

  return (
    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-6">
      <div className="space-y-8">
        {/* Welcome Text */}
        <div className="space-y-2">
          {loading ? (
            <>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold">Welcome back, {userName?.split(' ')[0]}!</h2>
              <p className="text-muted-foreground">Continue your learning journey with Rhetorica.AI</p>
            </>
          )}
        </div>

        {/* Course Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-12 left-6 right-6 h-12">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${(mainProgramCourses.length - 1) * 100} 48`}>
              <path
                d={pathDefinition}
                className="stroke-purple-200 dark:stroke-purple-800"
                fill="none"
                strokeWidth="2"
              />
              <path
                d={pathDefinition}
                className="stroke-purple-600 dark:stroke-purple-400"
                fill="none"
                strokeWidth="2"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                style={{ 
                  strokeDashoffset: `${1000 - (1000 * (parseInt(progressWidth) / 100))}`,
                  transition: 'stroke-dashoffset 500ms ease-in-out'
                }}
              />
            </svg>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {mainProgramCourses.map((course, index) => (
              <div key={course.id} className="relative">
                {/* Step Number and Icon */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  course.status !== 'not_started' ? 'bg-purple-600 text-white dark:bg-purple-400' : 'bg-purple-200 dark:bg-purple-800 text-purple-600 dark:text-purple-400'
                }`}>
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className="pt-8 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                    course.status !== 'not_started' ? 'bg-purple-600 text-white dark:bg-purple-400' : 'bg-purple-200 dark:bg-purple-800 text-purple-600 dark:text-purple-400'
                  }`}>
                    {getStatusIcon(course.status)}
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    course.status !== 'not_started' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {course.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {course.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 