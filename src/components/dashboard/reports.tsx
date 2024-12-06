import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data - replace with actual data in production
const trainingCompletionData = [
  { month: "Jan", completion: 65 },
  { month: "Feb", completion: 70 },
  { month: "Mar", completion: 75 },
  { month: "Apr", completion: 72 },
  { month: "May", completion: 80 },
  { month: "Jun", completion: 85 },
];

const attritionData = [
  { month: "Jan", rate: 2.1 },
  { month: "Feb", rate: 1.8 },
  { month: "Mar", rate: 2.3 },
  { month: "Apr", rate: 2.0 },
  { month: "May", rate: 1.9 },
  { month: "Jun", rate: 1.7 },
];

const departmentDistribution = [
  { name: "Engineering", value: 35 },
  { name: "Marketing", value: 20 },
  { name: "Sales", value: 25 },
  { name: "HR", value: 10 },
  { name: "Finance", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function Reports() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Training Completion Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Training Completion Trends</CardTitle>
            <CardDescription>Monthly completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    stroke="hsl(var(--primary))"
                    name="Completion Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attrition Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Attrition Analysis</CardTitle>
            <CardDescription>Monthly attrition rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attritionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="rate"
                    fill="hsl(var(--primary))"
                    name="Attrition Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employee distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Metrics</CardTitle>
            <CardDescription>Summary of important KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Training Completion
                  </p>
                  <p className="text-2xl font-bold">78%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Employee Satisfaction
                  </p>
                  <p className="text-2xl font-bold">4.2/5</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Training Programs
                  </p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Training Hours Delivered
                  </p>
                  <p className="text-2xl font-bold">1,240</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 