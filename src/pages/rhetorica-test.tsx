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
  questionType:
    | "Read Aloud"
    | "Repeat Sentence"
    | "Short Answer"
    | "Story Retell"
    | "Open Question"
    | "Situation Response";
  audioBlob: Blob;
  duration: number;
  scores?: {
    pronunciation?: number;
    fluency?: number;
    transcript?: string;
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
  type:
    | "Repeat Sentence"
    | "Short Answer"
    | "Story Retell"
    | "Situation Response";
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

interface SentenceBuildAnswer extends BaseAnswer {
  questionType: "Sentence Build";
  arrangedWords: string[];
  isCorrect: boolean;
  attempts: number;
}

type Question =
  | TextQuestion
  | AudioQuestion
  | SentenceBuildQuestion
  | SentenceCompletionQuestion;

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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [currentBlob, setCurrentBlob] = useState<Blob | undefined>(undefined);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();
  const {
    addAudioAnswer,
    addSentenceBuildAnswer,
    addSentenceCompletionAnswer,
    getSectionAnswers,
    updateScores,
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
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          console.log("Recording stopped, chunks:", chunksRef.current.length);
          const audioBlob = new Blob(chunksRef.current, {
            type: "audio/webm;codecs=opus",
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
      chunksRef.current = []; // Reset chunks ref
      setCurrentBlob(undefined);
      mediaRecorder.start(1000); // Record in 1-second chunks
    }
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeLeft(currentSection.time);
    }
  };

  const handleReadAloudEvaluation = async (scores: {
    pronunciation: number;
    fluency: number;
    transcript: string;
  }) => {
    if (currentBlob && currentQuestion.type === "Read Aloud") {
      console.log("Adding Read Aloud answer:", {
        section,
        questionIndex: step + 1,
        duration: currentSection.time - timeLeft,
        scores,
      });

      // Add answer to context
      addAudioAnswer(
        section,
        step,
        "Read Aloud",
        currentBlob,
        currentSection.time - timeLeft,
        {
          pronunciation: scores.pronunciation,
          fluency: scores.fluency,
          transcript: scores.transcript,
        }
      );

      handleNext();
      setCurrentBlob(undefined);
    } else {
      console.log("No recording provided for Read Aloud question");
      handleNext();
    }
  };

  const handleRepeatSentenceEvaluation = async (scores: {
    pronunciation: number;
    fluency: number;
    transcript: string;
  }) => {
    if (currentBlob && currentQuestion.type === "Repeat Sentence") {
      console.log("Adding Repeat Sentence answer:", {
        section,
        questionIndex: step + 1,
        duration: currentSection.time - timeLeft,
        scores,
      });

      // Add answer to context
      addAudioAnswer(
        section,
        step,
        "Repeat Sentence",
        currentBlob,
        currentSection.time - timeLeft,
        {
          pronunciation: scores.pronunciation,
          fluency: scores.fluency,
          transcript: scores.transcript,
        }
      );

      handleNext();
      setCurrentBlob(undefined);
    } else {
      console.log("No recording provided for Repeat Sentence question");
      handleNext();
    }
  };

  const handleShortAnswerEvaluation = async (scores: {
    pronunciation: number;
    fluency: number;
    transcript: string;
  }) => {
    if (currentBlob && currentQuestion.type === "Short Answer") {
      console.log("Adding Short Answer answer:", {
        section,
        questionIndex: step + 1,
        duration: currentSection.time - timeLeft,
        scores,
      });

      addAudioAnswer(
        section,
        step,
        "Short Answer",
        currentBlob,
        currentSection.time - timeLeft,
        {
          pronunciation: scores.pronunciation,
          fluency: scores.fluency,
          transcript: scores.transcript,
        }
      );

      handleNext();
      setCurrentBlob(undefined);
    } else {
      console.log("No recording provided for Short Answer question");
      handleNext();
    }
  };

  const handleNext = async () => {
    const isLastQuestionInSection = step === totalQuestions - 1;
    const isLastSection = section === sections.length - 1;

    if (!isLastQuestionInSection) {
      setStep(step + 1);
      setTimeLeft(currentSection.time);
    } else {
      // Last question in section
      console.log("Completing section:", currentSection.title);

      // For Section D, ensure we have the latest context
      if (currentSection.title === "Part D: Formation") {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Ensure we evaluate before moving to next section
      await handleSectionComplete();

      if (!isLastSection) {
        setSection(section + 1);
        setStep(0);
        setTimeLeft(sections[section + 1].time);
      } else {
        console.log("Test completed!");
        navigate("/rhetorica/report");
      }
    }

    setIsRecording(false);
    setIsPlaying(false);
  };

  const handleComplete = () => {
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleSentenceBuildComplete = async (
    arrangedWords: string[],
    isCorrect: boolean,
    attempts: number
  ) => {
    console.log("Completing Sentence Build question:", {
      section,
      questionIndex: step + 1,
      arrangedWords,
      isCorrect,
      attempts,
    });

    // Add answer to context
    addSentenceBuildAnswer(section, step, arrangedWords, isCorrect, attempts);

    // If this is the last question in Section D, wait for context update
    if (section === 3 && step === totalQuestions - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    handleNext();
  };

  const handleSentenceCompletionComplete = (
    textAnswer: string,
    audioBlob: Blob,
    isCorrect: boolean,
    attempts: number
  ) => {
    addSentenceCompletionAnswer(
      section,
      step,
      textAnswer,
      audioBlob,
      isCorrect,
      attempts
    );
    handleComplete();
  };

  const handleSectionComplete = async () => {
    if (currentSection.title === "Part A: Reading") {
      console.log("Starting Section A evaluation...");
      setIsEvaluating(true);
      const sectionAnswers = getSectionAnswers(section);

      if (!sectionAnswers) {
        console.log(
          "No answers found for Section A - user skipped all questions"
        );
        setIsEvaluating(false);
        return;
      }

      console.log(
        "Found answers for Section A:",
        Object.keys(sectionAnswers).length,
        "questions"
      );

      // Store all evaluation results
      const evaluationResults = [];
      let hasReadAloudAnswers = false;

      for (const [questionIndex, answer] of Object.entries(sectionAnswers)) {
        if (answer.questionType === "Read Aloud") {
          hasReadAloudAnswers = true;
          const audioAnswer = answer as AudioAnswer;
          const question = currentSection.questions[
            parseInt(questionIndex)
          ] as TextQuestion;

          // Skip if answer already has scores
          if (
            audioAnswer.scores?.pronunciation !== undefined &&
            audioAnswer.scores?.fluency !== undefined
          ) {
            console.log(
              `Question ${
                parseInt(questionIndex) + 1
              } already evaluated, skipping...`
            );
            evaluationResults.push({
              questionNumber: parseInt(questionIndex) + 1,
              referenceText: question.text,
              transcript: audioAnswer.scores.transcript || "",
              scores: {
                pronunciation: audioAnswer.scores.pronunciation,
                fluency: audioAnswer.scores.fluency,
                accuracy: 0, // We don't have these stored
                phonetic: 0, // We don't have these stored
              },
            });
            continue;
          }

          try {
            console.log(
              `Processing question ${parseInt(questionIndex) + 1}...`
            );
            const scores = await speechEvaluationService.evaluateReading(
              audioAnswer.audioBlob,
              question.text
            );

            updateScores(section, parseInt(questionIndex), {
              pronunciation: scores.pronunciation,
              fluency: scores.fluency,
              accuracy: scores.accuracy,
              phonetic: scores.phonetic,
              transcript: scores.transcript,
            });

            evaluationResults.push({
              questionNumber: parseInt(questionIndex) + 1,
              referenceText: question.text,
              transcript: scores.transcript,
              scores: {
                pronunciation: scores.pronunciation,
                fluency: scores.fluency,
                accuracy: scores.accuracy,
                phonetic: scores.phonetic,
              },
            });
          } catch (error) {
            console.error(
              `Error evaluating question ${parseInt(questionIndex) + 1}:`,
              error
            );
          }
        }
      }

      if (!hasReadAloudAnswers) {
        console.log(
          "No Read Aloud answers found in Section A - user skipped all Read Aloud questions"
        );
        setIsEvaluating(false);
        return;
      }

      if (evaluationResults.length > 0) {
        // Log consolidated results at the end of Section A
        console.log("\n=== Section A: Final Evaluation Results ===");
        evaluationResults.forEach((result) => {
          console.log(`\nQuestion ${result.questionNumber}:`);
          console.log("Reference:", result.referenceText);
          console.log("Transcript:", result.transcript);
          console.log("Scores:", {
            pronunciation: result.scores.pronunciation,
            fluency: result.scores.fluency,
            accuracy: result.scores.accuracy,
            phonetic: result.scores.phonetic,
          });
        });

        // Calculate and log average scores
        const averageScores = evaluationResults.reduce(
          (acc, curr) => ({
            pronunciation: acc.pronunciation + curr.scores.pronunciation,
            fluency: acc.fluency + curr.scores.fluency,
            accuracy: acc.accuracy + curr.scores.accuracy,
            phonetic: acc.phonetic + curr.scores.phonetic,
          }),
          { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0 }
        );

        const totalQuestions = evaluationResults.length;
        console.log("\nSection A Average Scores:", {
          pronunciation: Math.round(
            averageScores.pronunciation / totalQuestions
          ),
          fluency: Math.round(averageScores.fluency / totalQuestions),
          accuracy: Math.round(averageScores.accuracy / totalQuestions),
          phonetic: Math.round(averageScores.phonetic / totalQuestions),
        });
        console.log("=====================================\n");
      } else {
        console.log(
          "No evaluation results found for Section A - all evaluations failed"
        );
      }

      setIsEvaluating(false);
    } else if (currentSection.title === "Part B: Listening") {
      console.log("Starting Section B evaluation...");
      setIsEvaluating(true);
      const sectionAnswers = getSectionAnswers(section);

      if (!sectionAnswers) {
        console.log(
          "No answers found for Section B - user skipped all questions"
        );
        setIsEvaluating(false);
        return;
      }

      console.log(
        "Found answers for Section B:",
        Object.keys(sectionAnswers).length,
        "questions"
      );

      // Store all evaluation results
      const evaluationResults = [];
      let hasRepeatSentenceAnswers = false;

      for (const [questionIndex, answer] of Object.entries(sectionAnswers)) {
        if (answer.questionType === "Repeat Sentence") {
          hasRepeatSentenceAnswers = true;
          const audioAnswer = answer as AudioAnswer;
          const question = currentSection.questions[
            parseInt(questionIndex)
          ] as AudioQuestion;

          // Skip if answer already has scores
          if (
            audioAnswer.scores?.pronunciation !== undefined &&
            audioAnswer.scores?.fluency !== undefined
          ) {
            console.log(
              `Question ${
                parseInt(questionIndex) + 1
              } already evaluated, skipping...`
            );
            evaluationResults.push({
              questionNumber: parseInt(questionIndex) + 1,
              referenceText: question.solution,
              transcript: audioAnswer.scores.transcript || "",
              scores: {
                pronunciation: audioAnswer.scores.pronunciation,
                fluency: audioAnswer.scores.fluency,
                accuracy: 0,
                phonetic: 0,
              },
            });
            continue;
          }

          try {
            console.log(
              `Processing question ${parseInt(questionIndex) + 1}...`
            );
            const scores = await speechEvaluationService.evaluateReading(
              audioAnswer.audioBlob,
              question.solution
            );

            updateScores(section, parseInt(questionIndex), {
              pronunciation: scores.pronunciation,
              fluency: scores.fluency,
              accuracy: scores.accuracy,
              phonetic: scores.phonetic,
              transcript: scores.transcript,
            });

            evaluationResults.push({
              questionNumber: parseInt(questionIndex) + 1,
              referenceText: question.solution,
              transcript: scores.transcript,
              scores: {
                pronunciation: scores.pronunciation,
                fluency: scores.fluency,
                accuracy: scores.accuracy,
                phonetic: scores.phonetic,
              },
            });
          } catch (error) {
            console.error(
              `Error evaluating question ${parseInt(questionIndex) + 1}:`,
              error
            );
          }
        }
      }

      if (!hasRepeatSentenceAnswers) {
        console.log(
          "No Repeat Sentence answers found in Section B - user skipped all Repeat Sentence questions"
        );
        setIsEvaluating(false);
        return;
      }

      if (evaluationResults.length > 0) {
        // Log consolidated results at the end of Section B
        console.log("\n=== Section B: Final Evaluation Results ===");
        evaluationResults.forEach((result) => {
          console.log(`\nQuestion ${result.questionNumber}:`);
          console.log("Reference:", result.referenceText);
          console.log("Transcript:", result.transcript);
          console.log("Scores:", {
            pronunciation: result.scores.pronunciation,
            fluency: result.scores.fluency,
            accuracy: result.scores.accuracy,
            phonetic: result.scores.phonetic,
          });
        });

        // Calculate and log average scores
        const averageScores = evaluationResults.reduce(
          (acc, curr) => ({
            pronunciation: acc.pronunciation + curr.scores.pronunciation,
            fluency: acc.fluency + curr.scores.fluency,
            accuracy: acc.accuracy + curr.scores.accuracy,
            phonetic: acc.phonetic + curr.scores.phonetic,
          }),
          { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0 }
        );

        const totalQuestions = evaluationResults.length;
        console.log("\nSection B Average Scores:", {
          pronunciation: Math.round(
            averageScores.pronunciation / totalQuestions
          ),
          fluency: Math.round(averageScores.fluency / totalQuestions),
          accuracy: Math.round(averageScores.accuracy / totalQuestions),
          phonetic: Math.round(averageScores.phonetic / totalQuestions),
        });
        console.log("=====================================\n");
      } else {
        console.log(
          "No evaluation results found for Section B - all evaluations failed"
        );
      }

      setIsEvaluating(false);
    } else if (currentSection.title === "Part C: Speaking") {
      console.log("Starting Section C evaluation...");
      setIsEvaluating(true);
      const sectionAnswers = getSectionAnswers(section);

      if (!sectionAnswers) {
        console.log(
          "No answers found for Section C - user skipped all questions"
        );
        setIsEvaluating(false);
        return;
      }

      console.log(
        "Found answers for Section C:",
        Object.keys(sectionAnswers).length,
        "questions"
      );

      const evaluationResults = [];
      let hasShortAnswers = false;

      for (const [questionIndex, answer] of Object.entries(sectionAnswers)) {
        if (answer.questionType === "Short Answer") {
          hasShortAnswers = true;
          const audioAnswer = answer as AudioAnswer;
          const question = currentSection.questions[
            parseInt(questionIndex)
          ] as AudioQuestion;

          if (
            audioAnswer.scores?.pronunciation !== undefined &&
            audioAnswer.scores?.fluency !== undefined
          ) {
            console.log(
              `Question ${
                parseInt(questionIndex) + 1
              } already evaluated, skipping...`
            );
            evaluationResults.push({
              questionNumber: parseInt(questionIndex) + 1,
              referenceText: question.solution,
              transcript: audioAnswer.scores.transcript || "",
              scores: {
                pronunciation: audioAnswer.scores.pronunciation,
                fluency: audioAnswer.scores.fluency,
                accuracy: 0,
                phonetic: 0,
              },
            });
            continue;
          }

          try {
            console.log(
              `Processing question ${parseInt(questionIndex) + 1}...`
            );
            const scores = await speechEvaluationService.evaluateReading(
              audioAnswer.audioBlob,
              question.solution
            );

            updateScores(section, parseInt(questionIndex), {
              pronunciation: scores.pronunciation,
              fluency: scores.fluency,
              accuracy: scores.accuracy,
              phonetic: scores.phonetic,
              transcript: scores.transcript,
            });

            evaluationResults.push({
              questionNumber: parseInt(questionIndex) + 1,
              referenceText: question.solution,
              transcript: scores.transcript,
              scores: {
                pronunciation: scores.pronunciation,
                fluency: scores.fluency,
                accuracy: scores.accuracy,
                phonetic: scores.phonetic,
              },
            });
          } catch (error) {
            console.error(
              `Error evaluating question ${parseInt(questionIndex) + 1}:`,
              error
            );
          }
        }
      }

      if (!hasShortAnswers) {
        console.log(
          "No Short Answer answers found in Section C - user skipped all Short Answer questions"
        );
        setIsEvaluating(false);
        return;
      }

      if (evaluationResults.length > 0) {
        console.log("\n=== Section C: Final Evaluation Results ===");
        evaluationResults.forEach((result) => {
          console.log(`\nQuestion ${result.questionNumber}:`);
          console.log("Reference:", result.referenceText);
          console.log("Transcript:", result.transcript);
          console.log("Scores:", {
            pronunciation: result.scores.pronunciation,
            fluency: result.scores.fluency,
            accuracy: result.scores.accuracy,
            phonetic: result.scores.phonetic,
          });
        });

        const averageScores = evaluationResults.reduce(
          (acc, curr) => ({
            pronunciation: acc.pronunciation + curr.scores.pronunciation,
            fluency: acc.fluency + curr.scores.fluency,
            accuracy: acc.accuracy + curr.scores.accuracy,
            phonetic: acc.phonetic + curr.scores.phonetic,
          }),
          { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0 }
        );

        const totalQuestions = evaluationResults.length;
        console.log("\nSection C Average Scores:", {
          pronunciation: Math.round(
            averageScores.pronunciation / totalQuestions
          ),
          fluency: Math.round(averageScores.fluency / totalQuestions),
          accuracy: Math.round(averageScores.accuracy / totalQuestions),
          phonetic: Math.round(averageScores.phonetic / totalQuestions),
        });
        console.log("=====================================\n");
      } else {
        console.log(
          "No evaluation results found for Section C - all evaluations failed"
        );
      }

      setIsEvaluating(false);
    } else if (currentSection.title === "Part D: Formation") {
      console.log("Starting Section D evaluation...");
      setIsEvaluating(true);
      const sectionAnswers = getSectionAnswers(section);

      if (!sectionAnswers) {
        console.log(
          "No answers found for Section D - user skipped all questions"
        );
        setIsEvaluating(false);
        return;
      }

      console.log(
        "Found answers for Section D:",
        Object.keys(sectionAnswers).length,
        "questions"
      );

      const evaluationResults = [];
      let hasSentenceBuildAnswers = false;

      for (const [questionIndex, answer] of Object.entries(sectionAnswers)) {
        if (answer.questionType === "Sentence Build") {
          hasSentenceBuildAnswers = true;
          const buildAnswer = answer as SentenceBuildAnswer;
          const question = currentSection.questions[
            parseInt(questionIndex)
          ] as SentenceBuildQuestion;

          // Calculate sentence mastery score based on correctness and attempts
          const sentenceMastery = buildAnswer.isCorrect
            ? Math.max(100 - (buildAnswer.attempts - 1) * 20, 20) // Deduct 20 points per attempt, minimum 20
            : 0; // 0 if not correct at all
          const attempts = buildAnswer.attempts;
          const arrangedSentence = buildAnswer.arrangedWords.join(" ");

          evaluationResults.push({
            questionNumber: parseInt(questionIndex) + 1,
            solution: question.solution,
            userAnswer: arrangedSentence,
            scores: {
              sentenceMastery,
              attempts,
            },
          });
        }
      }

      if (!hasSentenceBuildAnswers) {
        console.log(
          "No Sentence Build answers found in Section D - user skipped all Sentence Build questions"
        );
        setIsEvaluating(false);
        return;
      }

      if (evaluationResults.length > 0) {
        console.log("\n=== Section D: Final Evaluation Results ===");
        evaluationResults.forEach((result) => {
          console.log(`\nQuestion ${result.questionNumber}:`);
          console.log("Solution:", result.solution);
          console.log("Your Answer:", result.userAnswer);
          console.log("Scores:", {
            sentenceMastery: result.scores.sentenceMastery,
            attempts: result.scores.attempts,
          });
        });

        // Calculate average scores
        const totalQuestions = evaluationResults.length;
        const averageMastery =
          evaluationResults.reduce(
            (acc, curr) => acc + curr.scores.sentenceMastery,
            0
          ) / totalQuestions;
        const averageAttempts =
          evaluationResults.reduce(
            (acc, curr) => acc + curr.scores.attempts,
            0
          ) / totalQuestions;

        console.log("\nSection D Average Scores:", {
          sentenceMastery: Math.round(averageMastery),
          attempts: Math.round(averageAttempts * 10) / 10, // One decimal place
        });
        console.log("=====================================\n");
      } else {
        console.log("No evaluation results found for Section D");
      }

      setIsEvaluating(false);
    } else {
      console.log("Completed section:", currentSection.title);
    }
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
            onClick={() => navigate("/employee/dashboard")}
            className="mr-4 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Rhetorica Test Practice</h1>
              <p className="text-sm text-muted-foreground">
                Section {section + 1} of {sections.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Time Remaining
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {timeLeft}s
              </span>
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
            <Progress
              value={((step + 1) / totalQuestions) * 100}
              className="w-32"
            />
            <span>
              Question {step + 1} of {totalQuestions}
            </span>
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
              onEvaluationComplete={handleRepeatSentenceEvaluation}
              recordedBlob={currentBlob}
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
              onEvaluationComplete={handleShortAnswerEvaluation}
              recordedBlob={currentBlob}
            />
          )}
          {currentQuestion.type === "Sentence Build" && (
            <SentenceBuildQuestion
              words={currentQuestion.words}
              solution={currentQuestion.solution}
              onComplete={(arrangedWords, isCorrect, attempts) =>
                handleSentenceBuildComplete(arrangedWords, isCorrect, attempts)
              }
              isLastQuestion={
                section === sections.length - 1 && step === totalQuestions - 1
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
                handleSentenceCompletionComplete(
                  textAnswer,
                  audioBlob,
                  isCorrect,
                  attempts
                )
              }
            />
          )}
        </div>

        {/* Next button - only show for sections that need recording except Sentence Build and Completion */}
        {needsRecording(currentQuestion) && 
         currentQuestion.type !== "Sentence Build" && (
          <div className="flex justify-center">
            <Button
              className="h-12 px-8 text-lg bg-primary/10 hover:bg-primary/20 text-primary"
              onClick={handleNext}
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
