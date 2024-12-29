import allCoursesData from "@/templates/allcources.json";

export interface AllCourse {
  id: string;
  title: string;
  avatar: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  description: string;
  chapters: Array<{
    id: number;
    title: string;
    duration: string;
    videoUrl: string;
    resources: string[];
    hasQuiz: boolean;
  }>;
  discussions: Array<{
    id: number;
    user: {
      name: string;
      avatar: string;
    };
    message: string;
    time: string;
    replies: number;
  }>;
}

export const allCoursesService = {
  getAllCourses: async (): Promise<AllCourse[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return allCoursesData.courses;
  }
}; 