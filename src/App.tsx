import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { UserProvider } from "./contexts/user-context";
import { ProtectedRoute } from "./components/auth/protected-route";
import { Login } from "./pages/login";
import { RhetoricaTest } from "./pages/rhetorica-test";
import { HRDashboard } from "./pages/hr/dashboard";
import { EmployeesPage } from "./pages/hr/employees";
import { EmployeeDetails } from "./pages/hr/employee-details";
import { CoursesPage } from "./pages/hr/courses";
import { HRCourseDetails } from "./pages/hr/course-details";
import { ReportsPage } from "./pages/hr/reports";
import { ReportDetails } from "./pages/hr/report-details";
import { EmployeeDashboard } from "./pages/employee/dashboard";
import { CoursesPage as EmployeeCoursesPage } from "./pages/employee/courses";
import { AllCoursesPage } from "./pages/employee/all-courses";
import { CourseDetails } from "./pages/employee/course-details";
import ChatInterface from "./pages/employee/voice-model";
import ConversationReport from "./pages/employee/conversation-report";
import { HRLayout } from "./layouts/hr-layout";
import { RhetoricaProvider } from "@/contexts/rhetorica-context";
import { RhetoricaReport } from "@/pages/rhetorica-report";
import { CreateCoursePage } from "./pages/hr/create-course";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <RhetoricaProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/rhetorica-test" element={<RhetoricaTest />} />
            <Route path="/rhetorica/test" element={<RhetoricaTest />} />
            <Route path="/rhetorica/report" element={<RhetoricaReport />} />
            
            {/* HR Routes */}
            <Route path="/hr/*" element={
              <ProtectedRoute allowedRole="hr">
                <HRLayout>
                  <Routes>
                    <Route path="dashboard" element={<HRDashboard />} />
                    <Route path="employees" element={<EmployeesPage />} />
                    <Route path="employees/:employeeId" element={<EmployeeDetails />} />
                    <Route path="courses" element={<CoursesPage />} />
                    <Route path="courses/create" element={<CreateCoursePage />} />
                    <Route path="courses/:courseId" element={<HRCourseDetails />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="reports/:empId/:testDate" element={<ReportDetails />} />
                    {/* Add other HR routes here */}
                    <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
                  </Routes>
                </HRLayout>
              </ProtectedRoute>
            } />
            
            {/* Employee Routes */}
            <Route path="/employee/*" element={
              <ProtectedRoute allowedRole="employee">
                <Routes>
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                  <Route path="courses" element={<EmployeeCoursesPage />} />
                  <Route path="all-courses" element={<AllCoursesPage />} />
                  <Route path="courses/:courseId" element={<CourseDetails />} />
                  <Route path="voice-test/:courseId" element={<ChatInterface />} />
                  <Route path="conversation-report" element={<ConversationReport />} />
                  {/* Add other employee routes here */}
                  <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </RhetoricaProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
