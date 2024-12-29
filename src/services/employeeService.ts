import employeeData from '../templates/employee.json';
import { EmployeeProfile, Course, RawCourse } from '@/types/employee';

// Helper function to simulate API delay
const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 2000); // 2 second delay
  });
};

// Helper function to ensure course status is properly typed
const transformCourse = (course: RawCourse): Course => ({
  id: course.id,
  name: course.name,
  status: course.status as 'completed' | 'in_progress' | 'not_started',
  category: course.category,
  author: course.author,
  description: course.description,
  avatar: course.avatar,
});

export const employeeService = {
  // Get employee profile and stats
  getEmployeeProfile: (): Promise<EmployeeProfile> => {
    return simulateApiCall({
      id: employeeData.id,
      name: employeeData.name,
      email: employeeData.email,
      avatar: employeeData.avatar,
      stats: employeeData.stats,
    });
  },

  // Get first 3 courses from learning path for dashboard
  getDashboardCourses: (): Promise<Course[]> => {
    const learningPathCourses: Course[] = employeeData.learning_path.courses
      .slice(0, 3)
      .map(transformCourse);
    return simulateApiCall(learningPathCourses);
  },

  // Get all courses (both main program and learning path)
  getAllCourses: (): Promise<Course[]> => {
    const allCourses: Course[] = [
      ...employeeData.main_program.courses.map(transformCourse),
      ...employeeData.learning_path.courses.map(transformCourse),
    ];
    return simulateApiCall(allCourses);
  },

  // Get learning path courses
  getLearningPathCourses: (): Promise<Course[]> => {
    return simulateApiCall(employeeData.learning_path.courses.map(transformCourse));
  },

  // Get main program courses
  getMainProgramCourses: (): Promise<Course[]> => {
    return simulateApiCall(employeeData.main_program.courses.map(transformCourse));
  },
}; 