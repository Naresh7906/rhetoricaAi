import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { UserProvider } from "./contexts/user-context";
import { ProtectedRoute } from "./components/auth/protected-route";
import { Login } from "./pages/login";
import { RhetoricaTest } from "./pages/rhetorica-test";
import { HRDashboard } from "./pages/hr/dashboard";
import { EmployeeDashboard } from "./pages/employee/dashboard";
import { CoursesPage } from "./pages/employee/courses";
import { AllCoursesPage } from "./pages/employee/all-courses";
import { CourseDetails } from "./pages/employee/course-details";
import ChatInterface from "./pages/employee/voice-model";
import ConversationReport from "./pages/employee/conversation-report";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <UserProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/rhetorica-test" element={<RhetoricaTest />} />
          
          {/* HR Routes */}
          <Route path="/hr/*" element={
            <ProtectedRoute allowedRole="hr">
              <Routes>
                <Route path="dashboard" element={<HRDashboard />} />
                {/* Add other HR routes here */}
                <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* Employee Routes */}
          <Route path="/employee/*" element={
            <ProtectedRoute allowedRole="employee">
              <Routes>
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="courses" element={<CoursesPage />} />
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
      </UserProvider>
    </ThemeProvider>
  );
}
