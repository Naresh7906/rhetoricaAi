import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation Skeleton */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </header>

      <div className="w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="xl:col-span-2 space-y-8">
            {/* Course Header Skeleton */}
            <div>
              <Skeleton className="h-10 w-2/3 mb-4" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* Current Chapter Skeleton */}
            <Card className="p-8">
              <Skeleton className="aspect-video w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-24 w-full mb-6" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-36" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </Card>

            {/* Discussion Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-32 mb-6" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-16 w-full mb-3" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-8">
            {/* Progress Card Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-6 w-36 mb-4" />
              <Skeleton className="h-2 w-full mb-3" />
              <Skeleton className="h-4 w-24" />
            </Card>

            {/* Chapters List Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg flex items-center gap-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full max-w-[200px] mb-2" />
                      <Skeleton className="h-3 w-16" />
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