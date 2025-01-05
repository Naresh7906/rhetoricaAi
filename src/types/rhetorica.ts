export interface BaseAnswer {
  questionType: string;
  timestamp: number;
}

export interface AudioAnswer extends BaseAnswer {
  questionType: "Read Aloud" | "Repeat Sentence" | "Short Answer" | "Story Retell" | "Open Question" | "Situation Response";
  audioBlob: Blob;
  duration: number;
  scores?: {
    pronunciation?: number;
    fluency?: number;
    transcript?: string;
  };
}

export interface BaseQuestion {
  type: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "Read Aloud" | "Open Question";
  text: string;
}

export interface AudioQuestion extends BaseQuestion {
  type: "Repeat Sentence" | "Short Answer" | "Story Retell" | "Situation Response";
  audio: string;
  text: string;
  solution: string;
}

export interface SentenceBuildQuestion extends BaseQuestion {
  type: "Sentence Build";
  words: string[];
  solution: string;
}

export interface SentenceCompletionQuestion extends BaseQuestion {
  type: "Sentence Completion";
  audio: string;
  text: string;
  solution: string;
}

export interface SentenceBuildAnswer extends BaseAnswer {
  questionType: "Sentence Build";
  arrangedWords: string[];
  isCorrect: boolean;
  attempts: number;
}

export type Question = TextQuestion | AudioQuestion | SentenceBuildQuestion | SentenceCompletionQuestion;

export interface Section {
  title: string;
  description: string;
  time: number;
  questions: Question[];
}

export const needsRecording = (question: Question): boolean => {
  return (
    question.type === "Read Aloud" ||
    question.type === "Repeat Sentence" ||
    question.type === "Short Answer" ||
    question.type === "Story Retell" ||
    question.type === "Open Question" ||
    question.type === "Situation Response" ||
    question.type === "Sentence Completion"
  );
}; 