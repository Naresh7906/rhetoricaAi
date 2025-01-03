import { useState } from "react";
import { useNavigate } from "react-router-dom";
import reportsData from "@/templates/reports.json";
import employeeData from "@/templates/employee.json";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface Report {
  emp_id: number;
  testDate: string;
  overallScore: number;
  scores: {
    pronunciation: number;
    fluency: number;
    sentenceMastery: number;
    vocabulary: number;
    comprehension: number;
  };
  detailedFeedback: {
    pronunciation: string;
    fluency: string;
    sentenceMastery: string;
    vocabulary: string;
    comprehension: string;
  };
  recommendations: string[];
}

export function ReportsPage() {
  const navigate = useNavigate();
  const [reports] = useState<Report[]>(reportsData);

  const getEmployeeName = (emp_id?: number) => {
    // For demo, we're using the single employee data
    return employeeData.name;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Performance Reports</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Test Date</TableHead>
              <TableHead>Overall Score</TableHead>
              <TableHead>Key Metrics</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={`${report.emp_id}-${report.testDate}`}>
                <TableCell className="font-medium">
                  {getEmployeeName(report.emp_id)}
                </TableCell>
                <TableCell>
                  {format(new Date(report.testDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className={getScoreColor(report.overallScore)}>
                      {report.overallScore}%
                    </span>
                    <Progress 
                      value={report.overallScore} 
                      className="w-20"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Pronunciation: {report.scores.pronunciation}%</div>
                      <div>Fluency: {report.scores.fluency}%</div>
                      <div>Sentence: {report.scores.sentenceMastery}%</div>
                      <div>Vocabulary: {report.scores.vocabulary}%</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/hr/reports/${report.emp_id}/${report.testDate}`)}
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