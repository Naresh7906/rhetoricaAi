import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  GraduationCap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import employeeData from "@/templates/employee.json";
import allCoursesData from "@/templates/allcources.json";
import reportsData from "@/templates/reports.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Modern, accessible color palette
const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171"];
const CHART_THEME = {
  backgroundColor: "var(--background)",
  textColor: "var(--foreground)",
};

export function HRDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCourses: 0,
    totalReports: 0
  });

  // Prepare chart data
  const courseStatusData = [
    { name: "Completed", value: employeeData.main_program.courses.filter(c => c.status === 'completed').length },
    { name: "In Progress", value: employeeData.main_program.courses.filter(c => c.status === 'in_progress').length },
    { name: "Not Started", value: employeeData.main_program.courses.filter(c => c.status === 'not_started').length },
  ];

  const courseCategories = allCoursesData.courses.reduce((acc, course) => {
    acc[course.category] = (acc[course.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const courseCategoryData = Object.entries(courseCategories)
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count in descending order

  useEffect(() => {
    // Calculate statistics
    const employeeCount = 1; // Since employee.json represents a single employee
    const coursesCount = allCoursesData.courses.length;
    const reportsCount = reportsData.length;

    setStats({
      totalEmployees: employeeCount,
      totalCourses: coursesCount,
      totalReports: reportsCount
    });
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/95 border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Total Employees</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{stats.totalEmployees}</p>
              <p className="text-sm text-muted-foreground">Active in the system</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Available Trainings</CardTitle>
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
              <p className="text-sm text-muted-foreground">Courses available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Total Reports</CardTitle>
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{stats.totalReports}</p>
              <p className="text-sm text-muted-foreground">Performance reports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Status Distribution */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Course Completion Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {courseStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Categories */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Course Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseCategoryData} margin={{ left: 20, right: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis 
                  dataKey="category" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
                <Bar 
                  dataKey="count" 
                  fill={COLORS[0]} 
                  name="Number of Courses"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 