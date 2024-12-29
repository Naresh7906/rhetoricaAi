import courseData from '../templates/mycourses.json';

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Chapter {
  id: number;
  title: string;
  completed: boolean;
  duration: string;
  videoUrl: string;
  resources: string[];
  hasQuiz: boolean;
}

export interface Discussion {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  time: string;
  replies: number;
}

export interface Course {
  id: string;
  title: string;
  avatar: string;
  status: string;
  category: string;
  author: Author;
  progress: number;
  description: string;
  chapters: Chapter[];
  discussions: Discussion[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getCourseById = async (courseId: string): Promise<Course | undefined> => {
  await delay(2000); // 2 second delay
  return courseData.courses.find(course => course.id === courseId);
};

export const getAllCourses = async (): Promise<Course[]> => {
  await delay(2000); // 2 second delay
  return courseData.courses;
}; 