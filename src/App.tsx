import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Login } from "./pages/login";
import { HRDashboard } from "./pages/hr/dashboard";
import { EmployeeDashboard } from "./pages/employee/dashboard";
import { CourseDetails } from "./pages/employee/course-details";
import ChatInterface from "./pages/employee/voice-model";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Routes>
        {/* Unified Login */}
        <Route path="/login" element={<Login />} />
        
        {/* HR Routes */}
        <Route path="/hr/dashboard" element={<HRDashboard />} />
        
        {/* Employee Routes */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/courses/:courseId" element={<CourseDetails />} />
        <Route path="/employee/voice-test/:courseId" element={<ChatInterface />} />
        
        {/* Default redirect */}
        <Route path="*" element={<Login />} />
      </Routes>
    </ThemeProvider>
  );
}
