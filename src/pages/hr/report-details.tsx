import { useParams } from "react-router-dom";
import { format } from "date-fns";
import reportsData from "@/templates/reports.json";
import employeeData from "@/templates/employee.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ReportDetails() {
  const navigate = useNavigate();
  const { empId, testDate } = useParams();
  
  const report = reportsData.find(
    r => r.emp_id.toString() === empId && r.testDate === testDate
  );

  if (!report) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Report not found</h2>
          <p className="text-muted-foreground">The report you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="mx-auto p-6 ">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/hr/reports')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Reports
      </Button>

      {/* Report Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{employeeData.name}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(report.testDate), 'MMMM dd, yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <div className={`text-3xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}%
                </div>
              </div>
              <Progress 
                value={report.overallScore} 
                className="w-24 h-2"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Detailed breakdown of test scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(report.scores).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                    {value}%
                  </span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested actions for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
            <CardDescription>Assessment of various skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(report.detailedFeedback).map(([key, value]) => (
                <Card key={key} className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 