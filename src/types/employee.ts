export interface EmployeeProfile {
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
}

export interface Course {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'not_started';
  category: string;
  author: string;
  description: string;
  avatar: string;
}

export interface RawCourse {
  id: string;
  name: string;
  status: string;
  category: string;
  author: string;
  description: string;
  avatar: string;
}

export interface StatItem {
  label: string;
  value: string;
  icon: React.FC<{ className?: string }>;
  color: string;
} 