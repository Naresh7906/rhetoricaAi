import { createContext, useContext, useState, ReactNode } from "react";

// Types for different kinds of answers
interface BaseAnswer {
  questionType: string;
  timestamp: number;
  scores?: {
    pronunciation?: number;
    fluency?: number;
    transcript?: string;
  };
}

interface EvaluationScores {
  pronunciation?: number;
  fluency?: number;
  accuracy?: number;
  phonetic?: number;
  transcript?: string;
}

interface AudioAnswer extends BaseAnswer {
  questionType: "Read Aloud" | "Repeat Sentence" | "Short Answer" | "Story Retell" | "Open Question" | "Situation Response";
  audioBlob: Blob;
  duration: number;
  scores?: EvaluationScores;
}

interface SentenceBuildAnswer extends BaseAnswer {
  questionType: "Sentence Build";
  arrangedWords: string[];
  isCorrect: boolean;
  attempts: number;
}

interface SentenceCompletionAnswer extends BaseAnswer {
  questionType: "Sentence Completion";
  textAnswer: string;
  audioBlob: Blob;
  isCorrect: boolean;
  attempts: number;
  scores?: EvaluationScores;
}

type Answer = AudioAnswer | SentenceBuildAnswer | SentenceCompletionAnswer;

// Interface for the answers map
interface AnswersMap {
  [sectionIndex: number]: {
    [questionIndex: number]: Answer;
  };
}

// Context interface
interface RhetoricaContextType {
  // Answers storage
  answers: AnswersMap;
  
  // Methods for managing answers
  addAudioAnswer: (
    sectionIndex: number,
    questionIndex: number,
    questionType: AudioAnswer["questionType"],
    audioBlob: Blob,
    duration: number,
    scores?: EvaluationScores
  ) => void;
  
  addSentenceBuildAnswer: (
    sectionIndex: number,
    questionIndex: number,
    arrangedWords: string[],
    isCorrect: boolean,
    attempts: number
  ) => void;
  
  addSentenceCompletionAnswer: (
    sectionIndex: number,
    questionIndex: number,
    textAnswer: string,
    audioBlob: Blob,
    isCorrect: boolean,
    attempts: number,
    scores?: EvaluationScores
  ) => void;

  // Update scores for an existing answer
  updateScores: (
    sectionIndex: number,
    questionIndex: number,
    scores: EvaluationScores
  ) => void;

  // Get answers for a specific question
  getAnswer: (sectionIndex: number, questionIndex: number) => Answer | undefined;
  
  // Get all answers for a section
  getSectionAnswers: (sectionIndex: number) => { [questionIndex: number]: Answer } | undefined;
  
  // Clear answers
  clearAnswers: () => void;
  clearSectionAnswers: (sectionIndex: number) => void;
}

// Create the context
const RhetoricaContext = createContext<RhetoricaContextType | undefined>(undefined);

// Provider component
export function RhetoricaProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<AnswersMap>({});

  const addAudioAnswer: RhetoricaContextType["addAudioAnswer"] = (
    sectionIndex,
    questionIndex,
    questionType,
    audioBlob,
    duration,
    scores
  ) => {
    setAnswers(prev => ({
      ...prev,
      [sectionIndex]: {
        ...prev[sectionIndex],
        [questionIndex]: {
          questionType,
          audioBlob,
          duration,
          scores,
          timestamp: Date.now(),
        },
      },
    }));
  };

  const addSentenceBuildAnswer: RhetoricaContextType["addSentenceBuildAnswer"] = (
    sectionIndex,
    questionIndex,
    arrangedWords,
    isCorrect,
    attempts
  ) => {
    setAnswers(prev => ({
      ...prev,
      [sectionIndex]: {
        ...prev[sectionIndex],
        [questionIndex]: {
          questionType: "Sentence Build",
          arrangedWords,
          isCorrect,
          attempts,
          timestamp: Date.now(),
        },
      },
    }));
  };

  const addSentenceCompletionAnswer: RhetoricaContextType["addSentenceCompletionAnswer"] = (
    sectionIndex,
    questionIndex,
    textAnswer,
    audioBlob,
    isCorrect,
    attempts,
    scores
  ) => {
    setAnswers(prev => ({
      ...prev,
      [sectionIndex]: {
        ...prev[sectionIndex],
        [questionIndex]: {
          questionType: "Sentence Completion",
          textAnswer,
          audioBlob,
          isCorrect,
          attempts,
          scores,
          timestamp: Date.now(),
        },
      },
    }));
  };

  const updateScores: RhetoricaContextType["updateScores"] = (
    sectionIndex,
    questionIndex,
    scores
  ) => {
    setAnswers(prev => {
      const answer = prev[sectionIndex]?.[questionIndex];
      if (!answer) return prev;

      return {
        ...prev,
        [sectionIndex]: {
          ...prev[sectionIndex],
          [questionIndex]: {
            ...answer,
            scores: {
              ...answer.scores,
              ...scores,
            },
          },
        },
      };
    });
  };

  const getAnswer: RhetoricaContextType["getAnswer"] = (sectionIndex, questionIndex) => {
    return answers[sectionIndex]?.[questionIndex];
  };

  const getSectionAnswers: RhetoricaContextType["getSectionAnswers"] = (sectionIndex) => {
    return answers[sectionIndex];
  };

  const clearAnswers = () => {
    setAnswers({});
  };

  const clearSectionAnswers = (sectionIndex: number) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[sectionIndex];
      return newAnswers;
    });
  };

  return (
    <RhetoricaContext.Provider
      value={{
        answers,
        addAudioAnswer,
        addSentenceBuildAnswer,
        addSentenceCompletionAnswer,
        updateScores,
        getAnswer,
        getSectionAnswers,
        clearAnswers,
        clearSectionAnswers,
      }}
    >
      {children}
    </RhetoricaContext.Provider>
  );
}

// Custom hook for using the context
export function useRhetorica() {
  const context = useContext(RhetoricaContext);
  if (context === undefined) {
    throw new Error("useRhetorica must be used within a RhetoricaProvider");
  }
  return context;
} 