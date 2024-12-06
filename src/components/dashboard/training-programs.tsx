import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock data - replace with actual data in production
const mockPrograms = [
  {
    id: 1,
    title: "Communication Skills",
    description: "Enhance verbal and written communication skills",
    enrolledCount: 45,
    completionRate: 75,
    modules: ["Basic Communication", "Business Writing", "Public Speaking"],
    duration: "4 weeks",
  },
  {
    id: 2,
    title: "Leadership Development",
    description: "Develop essential leadership and management skills",
    enrolledCount: 30,
    completionRate: 60,
    modules: ["Team Management", "Decision Making", "Strategic Planning"],
    duration: "6 weeks",
  },
  {
    id: 3,
    title: "Technical Skills",
    description: "Advanced technical training for IT professionals",
    enrolledCount: 25,
    completionRate: 85,
    modules: ["Programming", "System Design", "Cloud Computing"],
    duration: "8 weeks",
  },
];

export function TrainingPrograms() {
  const [programs] = useState(mockPrograms);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Training Programs</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Program
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Card key={program.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{program.title}</CardTitle>
              <CardDescription>{program.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {program.enrolledCount} Enrolled
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {program.duration}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {program.completionRate}%
                    </span>
                  </div>
                  <Progress value={program.completionRate} />
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Modules</span>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {program.modules.map((module, index) => (
                      <li key={index}>{module}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <div className="flex space-x-2">
                <Button className="flex-1" variant="outline">
                  Edit
                </Button>
                <Button className="flex-1">View Details</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 