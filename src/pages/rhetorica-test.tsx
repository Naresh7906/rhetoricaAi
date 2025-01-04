import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import testData from "@/templates/rhetorica.json";
import { ReadAloudQuestion } from "@/components/rhetorica/ReadAloudQuestion";
import { RepeatSentenceQuestion } from "@/components/rhetorica/RepeatSentenceQuestion";
import { ShortAnswerQuestion } from "@/components/rhetorica/ShortAnswerQuestion";
import { SentenceBuildQuestion } from "@/components/rhetorica/SentenceBuildQuestion";
import { StoryRetellQuestion } from "@/components/rhetorica/StoryRetellQuestion";
import { OpenQuestion } from "@/components/rhetorica/OpenQuestion";
import { SituationResponseQuestion } from "@/components/rhetorica/SituationResponseQuestion";
import { SentenceCompletionQuestion } from "@/components/rhetorica/SentenceCompletionQuestion";
import { useRhetorica } from "@/contexts/rhetorica-context";
import { SpeechEvaluationService } from "@/services/speechEvaluationService";

interface BaseAnswer {
  questionType: string;
  timestamp: number;
}

interface AudioAnswer extends BaseAnswer {
  questionType: "Read Aloud" | "Repeat Sentence" | "Short Answer" | "Story Retell" | "Open Question" | "Situation Response";
  audioBlob: Blob;
  duration: number;
  scores?: {
    pronunciation?: number;
    fluency?: number;
  };
}

interface BaseQuestion {
  type: string;
}

interface TextQuestion extends BaseQuestion {
  type: "Read Aloud" | "Open Question";
  text: string;
}

interface AudioQuestion extends BaseQuestion {
  type: "Repeat Sentence" | "Short Answer" | "Story Retell" | "Situation Response";
  audio: string;
  text: string;
  solution: string;
}

interface SentenceBuildQuestion extends BaseQuestion {
  type: "Sentence Build";
  words: string[];
  solution: string;
}

interface SentenceCompletionQuestion extends BaseQuestion {
  type: "Sentence Completion";
  audio: string;
  text: string;
  solution: string;
}

type Question = TextQuestion | AudioQuestion | SentenceBuildQuestion | SentenceCompletionQuestion;

interface Section {
  title: string;
  description: string;
  time: number;
  questions: Question[];
}

const needsRecording = (question: Question): boolean => {
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

export function RhetoricaTest() {
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [section, setSection] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentBlob, setCurrentBlob] = useState<Blob | undefined>(undefined);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const { 
    addAudioAnswer, 
    addSentenceBuildAnswer, 
    addSentenceCompletionAnswer,
    getSectionAnswers,
    updateScores 
  } = useRhetorica();
  const speechEvaluationService = new SpeechEvaluationService();

  const sections = testData.sections as Section[];
  const currentSection = sections[section];
  const currentQuestion = currentSection?.questions[step];
  const totalQuestions = currentSection?.questions.length || 0;

  // Add new state for section completion
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Initialize media recorder
  useEffect(() => {
    async function initMediaRecorder() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            console.log("Recording chunk received:", {
              size: e.data.size,
              type: e.data.type,
              timestamp: new Date().toISOString()
            });
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          console.log("Recording stopped, chunks:", chunksRef.current.length);
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
          console.log("Created audio blob:", {
            size: audioBlob.size,
            type: audioBlob.type
          });
          setCurrentBlob(audioBlob);
          // Reset chunks for next recording
          chunksRef.current = [];
        };

        setMediaRecorder(recorder);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    }

    initMediaRecorder();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && isRecording) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRecording) {
      handleRecord(); // Stop recording when time is up
    }
    return () => clearInterval(timer);
  }, [timeLeft, isRecording]);

  const handleRecord = () => {
    if (!mediaRecorder) return;

    if (isRecording) {
      console.log("Stopping recording...");
      mediaRecorder.stop();
    } else {
      console.log("Starting recording...");
      chunksRef.current = [];  // Reset chunks ref
      setCurrentBlob(undefined);
      mediaRecorder.start(1000); // Record in 1-second chunks
    }
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeLeft(currentSection.time);
    }
  };

  const handleReadAloudEvaluation = (scores: { pronunciation: number; fluency: number; transcript: string }) => {
    if (currentBlob && currentQuestion.type === "Read Aloud") {
      console.log("Read Aloud Evaluation Results:", {
        scores,
        referenceText: currentQuestion.text,
        questionIndex: step + 1
      });

      addAudioAnswer(
        section,
        step,
        "Read Aloud",
        currentBlob,
        timeLeft,
        {
          pronunciation: scores.pronunciation,
          fluency: scores.fluency,
          transcript: scores.transcript
        }
      );
      handleNext();
      setCurrentBlob(undefined);
    }
  };

  const handleSectionComplete = async () => {
    if (currentSection.title === "Section A: Reading") {
      setIsEvaluating(true);
      const sectionAnswers = getSectionAnswers(section);
      
      if (sectionAnswers) {
        console.log("Evaluating Section A recordings...");
        
        for (const [questionIndex, answer] of Object.entries(sectionAnswers)) {
          if (answer.questionType === "Read Aloud") {
            const audioAnswer = answer as AudioAnswer;
            const question = currentSection.questions[parseInt(questionIndex)] as TextQuestion;
            try {
              console.log(`Evaluating question ${parseInt(questionIndex) + 1}...`);
              const scores = await speechEvaluationService.evaluateReading(
                audioAnswer.audioBlob,
                question.text
              );
              
              updateScores(section, parseInt(questionIndex), {
                pronunciation: scores.pronunciation,
                fluency: scores.fluency
              });

              console.log(`Question ${parseInt(questionIndex) + 1} scores:`, {
                pronunciation: scores.pronunciation,
                fluency: scores.fluency
              });
            } catch (error) {
              console.error(`Error evaluating question ${parseInt(questionIndex) + 1}:`, error);
            }
          }
        }
        
        // Log final results
        const finalAnswers = getSectionAnswers(section);
        console.log("Section A final results:", finalAnswers);
      }
      
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (step < totalQuestions - 1) {
      setStep(step + 1);
      setTimeLeft(currentSection.time);
    } else if (section < sections.length - 1) {
      // Evaluate section before moving to next
      handleSectionComplete().then(() => {
        setSection(section + 1);
        setStep(0);
        setTimeLeft(sections[section + 1].time);
      });
    } else {
      // Handle test completion
      handleSectionComplete().then(() => {
        // Navigate or show results
        console.log("Test completed!");
      });
    }
    setIsRecording(false);
    setIsPlaying(false);
  };

  const handleComplete = () => {
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleSentenceBuildComplete = (arrangedWords: string[], isCorrect: boolean, attempts: number) => {
    addSentenceBuildAnswer(section, step, arrangedWords, isCorrect, attempts);
    handleComplete();
  };

  const handleSentenceCompletionComplete = (
    textAnswer: string,
    audioBlob: Blob,
    isCorrect: boolean,
    attempts: number
  ) => {
    addSentenceCompletionAnswer(section, step, textAnswer, audioBlob, isCorrect, attempts);
    handleComplete();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-background" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      
      {/* Top navigation bar */}
      <nav className="relative z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employee/dashboard')}
            className="mr-4 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Rhetorica Test Practice</h1>
              <p className="text-sm text-muted-foreground">Section {section + 1} of {sections.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Time Remaining</span>
              <span className="text-lg font-semibold tabular-nums">{timeLeft}s</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 container max-w-5xl mx-auto px-4 py-8">
        {/* Section info */}
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-bold text-purple-500 dark:text-purple-400">
            {currentSection.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {currentSection.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Progress value={(step + 1) / totalQuestions * 100} className="w-32" />
            <span>Question {step + 1} of {totalQuestions}</span>
          </div>
        </div>

        {/* Question content */}
        <div className="mb-8 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-xl">
          {currentQuestion.type === "Read Aloud" && (
            <ReadAloudQuestion
              text={currentQuestion.text}
              isRecording={isRecording}
              onRecord={handleRecord}
              timeLeft={timeLeft}
              onEvaluationComplete={handleReadAloudEvaluation}
              recordedBlob={currentBlob}
            />
          )}
          {currentQuestion.type === "Repeat Sentence" && (
            <RepeatSentenceQuestion
              audio={currentQuestion.audio}
              solution={currentQuestion.solution || ""}
              isRecording={isRecording}
              isPlaying={isPlaying}
              onRecord={handleRecord}
              onPlayComplete={() => setIsPlaying(false)}
              timeLeft={timeLeft}
            />
          )}
          {currentQuestion.type === "Short Answer" && (
            <ShortAnswerQuestion
              audio={currentQuestion.audio}
              text={currentQuestion.text}
              isRecording={isRecording}
              isPlaying={isPlaying}
              onRecord={handleRecord}
              onPlayComplete={() => setIsPlaying(false)}
              timeLeft={timeLeft}
            />
          )}
          {currentQuestion.type === "Sentence Build" && (
            <SentenceBuildQuestion
              words={currentQuestion.words}
              solution={currentQuestion.solution}
              onComplete={(arrangedWords, isCorrect, attempts) => 
                handleSentenceBuildComplete(arrangedWords, isCorrect, attempts)
              }
            />
          )}
          {currentQuestion.type === "Story Retell" && (
            <StoryRetellQuestion
              audio={currentQuestion.audio}
              text={currentQuestion.text}
              isRecording={isRecording}
              isPlaying={isPlaying}
              onRecord={handleRecord}
              onPlayComplete={() => setIsPlaying(false)}
              timeLeft={timeLeft}
            />
          )}
          {currentQuestion.type === "Open Question" && (
            <OpenQuestion
              text={currentQuestion.text}
              isRecording={isRecording}
              onRecord={handleRecord}
              timeLeft={timeLeft}
            />
          )}
          {currentQuestion.type === "Situation Response" && (
            <SituationResponseQuestion
              audio={currentQuestion.audio}
              text={currentQuestion.text}
              isRecording={isRecording}
              isPlaying={isPlaying}
              onRecord={handleRecord}
              onPlayComplete={() => setIsPlaying(false)}
              timeLeft={timeLeft}
            />
          )}
          {currentQuestion.type === "Sentence Completion" && (
            <SentenceCompletionQuestion
              text={currentQuestion.text}
              audio={currentQuestion.audio}
              solution={currentQuestion.solution}
              isRecording={isRecording}
              isPlaying={isPlaying}
              onRecord={handleRecord}
              onPlayComplete={() => setIsPlaying(false)}
              timeLeft={timeLeft}
              onComplete={(textAnswer, audioBlob, isCorrect, attempts) =>
                handleSentenceCompletionComplete(textAnswer, audioBlob, isCorrect, attempts)
              }
            />
          )}
        </div>

        {/* Next button - only show for sections that need recording except Sentence Build and Completion */}
        {needsRecording(currentQuestion) && 
         currentQuestion.type !== "Sentence Build" && 
         currentQuestion.type !== "Sentence Completion" && (
          <div className="flex justify-center">
            <Button
              className="h-12 px-8 text-lg bg-primary/10 hover:bg-primary/20 text-primary"
              onClick={handleNext}
              disabled={section === sections.length - 1 && step === totalQuestions - 1}
            >
              {section === sections.length - 1 && step === totalQuestions - 1
                ? "Finish Test"
                : "Next Question"}
            </Button>
          </div>
        )}
      </main>

      {/* Add evaluation indicator */}
      {isEvaluating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl">
            <p className="text-lg">Evaluating section recordings...</p>
          </div>
        </div>
      )}
    </div>
  );
} 