import { useParams } from "react-router-dom";
import employeeData from "@/templates/employee.json";
import reportsData from "@/templates/reports.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  Mail,
  GraduationCap,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  BarChart,
  TrendingDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function EmployeeDetails() {
  const { employeeId } = useParams();
  // For demo, we'll use the single employee data
  const employee = employeeData;
  const employeeReports = reportsData.filter(r => r.emp_id.toString() === employeeId);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Employee not found</h2>
          <p className="text-muted-foreground">The employee you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <BarChart className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Prepare performance trend data
  const performanceTrendData = employeeReports.map(report => ({
    date: `Report ${report.emp_id}`,
    performance: report.overallScore,
    pronunciation: report.scores.pronunciation,
    fluency: report.scores.fluency,
    comprehension: report.scores.comprehension,
  }));

  return (
    <div className="mx-auto p-6">
      {/* Employee Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <div className="flex items-start space-x-4">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="h-20 w-20 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">{employee.name}</h1>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="secondary">ID: {employee.id}</Badge>
                <div className="flex items-center space-x-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-sm">{employee.stats.completed_courses} courses completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.stats.average_score}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.stats.certifications}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid gap-6">
            {/* Current Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>
                  {employee.main_program.courses.length} courses in the learning path
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employee.main_program.courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {getStatusIcon(course.status)}
                        </div>
                        <div>
                          <div className="font-medium">{course.name}</div>
                          <div className={`text-sm ${getStatusColor(course.status)}`}>
                            {course.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{employee.stats.learning_hours}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{employee.stats.completed_courses}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{employee.stats.certifications}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-6">
            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="performance" 
                      stroke="#3b82f6" 
                      name="Overall Performance"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pronunciation" 
                      stroke="#34d399" 
                      name="Pronunciation"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fluency" 
                      stroke="#fbbf24" 
                      name="Fluency"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="comprehension" 
                      stroke="#f87171" 
                      name="Comprehension"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Latest Performance Report */}
            {employeeReports[0] && (
              <Card>
                <CardHeader>
                  <CardTitle>Latest Performance Summary</CardTitle>
                  <CardDescription>From the most recent assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Overall Score</span>
                        <span className="font-bold">{employeeReports[0].overallScore}%</span>
                      </div>
                      <Progress value={employeeReports[0].overallScore} className="h-2" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Detailed Feedback</h4>
                        {Object.entries(employeeReports[0].detailedFeedback).map(([key, value]) => (
                          <div key={key} className="mb-2">
                            <div className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                            <p className="text-sm text-muted-foreground">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {employeeReports[0].recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 