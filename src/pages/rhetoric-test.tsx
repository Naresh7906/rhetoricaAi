import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, PlayCircle, StopCircle, Volume2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import testData from "@/templates/rhetoric.json";

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
}

interface SentenceBuildQuestion extends BaseQuestion {
  type: "Sentence Build";
  words: string[];
  solution: string;
}

type Question = TextQuestion | AudioQuestion | SentenceBuildQuestion;

interface Section {
  title: string;
  description: string;
  time: number;
  questions: Question[];
}

const isTextQuestion = (question: Question): question is TextQuestion => {
  return question.type === "Read Aloud" || question.type === "Open Question";
};

const isAudioQuestion = (question: Question): question is AudioQuestion => {
  return ["Repeat Sentence", "Short Answer", "Story Retell", "Situation Response"].includes(question.type);
};

const isSentenceBuildQuestion = (question: Question): question is SentenceBuildQuestion => {
  return question.type === "Sentence Build";
};

export function RhetoricTest() {
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [section, setSection] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  const sections = testData.sections as Section[];

  const currentSection = sections[section];
  const currentQuestion = currentSection?.questions[step];
  const totalQuestions = currentSection?.questions.length || 0;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && isRecording) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isRecording]);

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeLeft(currentSection.time);
    }
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (step < totalQuestions - 1) {
      setStep(step + 1);
      setTimeLeft(currentSection.time);
    } else if (section < sections.length - 1) {
      setSection(section + 1);
      setStep(0);
      setTimeLeft(sections[section + 1].time);
    }
    setIsRecording(false);
    setIsPlaying(false);
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
              <h1 className="text-lg font-semibold">Rhetoric Test Practice</h1>
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
          {isTextQuestion(currentQuestion) && (
            <p className="text-xl leading-relaxed">{currentQuestion.text}</p>
          )}
          {isAudioQuestion(currentQuestion) && (
            <div className="space-y-6">
              <Button
                variant="outline"
                className="w-full h-20 text-lg hover:bg-purple-500/5"
                onClick={handlePlayAudio}
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <>
                    <Volume2 className="w-8 h-8 text-purple-500 animate-pulse mr-3" />
                    <span>Playing Audio...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-8 h-8 text-purple-500 mr-3" />
                    <span>Play Audio</span>
                  </>
                )}
              </Button>
              <audio
                ref={audioRef}
                src={currentQuestion.audio}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <p className="text-muted-foreground text-lg italic text-center">
                {currentQuestion.text}
              </p>
            </div>
          )}
          {isSentenceBuildQuestion(currentQuestion) && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {currentQuestion.words.map((word: string, index: number) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-lg font-medium hover:bg-purple-500/20 cursor-pointer transition-colors"
                  >
                    {word}
                  </div>
                ))}
              </div>
              <p className="text-center text-muted-foreground">
                Arrange these words to form a complete sentence
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 max-w-2xl mx-auto">
          <Button
            className={`flex-1 h-16 text-lg ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
            } transition-colors`}
            onClick={handleRecord}
          >
            {isRecording ? (
              <>
                <StopCircle className="w-6 h-6 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          <Button
            className="flex-1 h-16 text-lg bg-primary/10 hover:bg-primary/20 text-primary"
            onClick={handleNext}
            disabled={section === sections.length - 1 && step === totalQuestions - 1}
          >
            {section === sections.length - 1 && step === totalQuestions - 1
              ? "Finish Test"
              : "Next Question"}
          </Button>
        </div>
      </main>
    </div>
  );
} 