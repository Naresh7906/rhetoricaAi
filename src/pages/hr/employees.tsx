import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import employeeData from "@/templates/employee.json";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  stats: {
    completed_courses: number;
    average_score: number;
    certifications: number;
    learning_hours: number;
  };
  main_program: {
    courses: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  };
}

export function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([employeeData]);

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Courses</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={employee.avatar} 
                      alt={employee.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <span>{employee.name}</span>
                  </div>
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {employee.main_program.courses.map((course) => (
                      <div key={course.id} className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{course.name}</span>
                        <Badge 
                          variant={
                            course.status === 'completed' 
                              ? 'default' 
                              : course.status === 'in_progress' 
                              ? 'secondary' 
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {course.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {employee.stats.completed_courses} completed
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.stats.learning_hours} learning hours
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="text-sm">
                      Average Score: {employee.stats.average_score}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.stats.certifications} certifications
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/hr/employees/${employee.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 