export interface Course {
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
} 