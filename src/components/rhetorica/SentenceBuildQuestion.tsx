import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";

interface SentenceBuildQuestionProps {
  words: string[];
  solution: string;
  onComplete: (arrangedWords: string[], isCorrect: boolean, attempts: number) => void;
}

export function SentenceBuildQuestion({
  words,
  solution,
  onComplete,
}: SentenceBuildQuestionProps) {
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Initialize the words when the component mounts or when words prop changes
  useEffect(() => {
    setArrangedWords([]);
    setRemainingWords([...words]);
    setHasSubmitted(false);
  }, [words]);

  const handleAddWord = (word: string, index: number) => {
    setArrangedWords([...arrangedWords, word]);
    const newRemaining = [...remainingWords];
    newRemaining.splice(index, 1);
    setRemainingWords(newRemaining);
  };

  const handleRemoveWord = (index: number) => {
    const word = arrangedWords[index];
    const newArranged = [...arrangedWords];
    newArranged.splice(index, 1);
    setArrangedWords(newArranged);
    setRemainingWords([...remainingWords, word]);
  };

  const handleMoveWord = (fromIndex: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && fromIndex === 0) ||
      (direction === 'right' && fromIndex === arrangedWords.length - 1)
    ) {
      return;
    }

    const newArranged = [...arrangedWords];
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    const [removed] = newArranged.splice(fromIndex, 1);
    newArranged.splice(toIndex, 0, removed);
    setArrangedWords(newArranged);
  };

  const handleReset = () => {
    setArrangedWords([]);
    setRemainingWords([...words]);
    setHasSubmitted(false);
  };

  const getCurrentSentence = () => arrangedWords.join(" ");
  const isCorrect = getCurrentSentence().toLowerCase() === solution.toLowerCase();

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (onComplete) {
      onComplete(arrangedWords, isCorrect, 0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Arranged words area */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-muted-foreground">Your sentence:</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-muted-foreground hover:text-primary"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
        <div
          className={`flex flex-wrap gap-3 min-h-[80px] items-center rounded-lg p-4 border-2 border-dashed ${
            hasSubmitted && isCorrect
              ? "bg-green-500/10 border-green-500/30"
              : arrangedWords.length > 0
              ? "bg-card/30 border-border"
              : "bg-muted/30 border-muted"
          }`}
        >
          {arrangedWords.map((word, index) => (
            <div key={index} className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveWord(index, 'left')}
                disabled={index === 0}
                className="h-8 px-1 text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div
                onClick={() => handleRemoveWord(index)}
                className={`px-4 py-2 rounded-lg ${
                  hasSubmitted && isCorrect
                    ? "bg-green-500/20 text-green-700 dark:text-green-300"
                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                } text-lg font-medium hover:bg-purple-500/20 cursor-pointer transition-colors`}
              >
                {word}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveWord(index, 'right')}
                disabled={index === arrangedWords.length - 1}
                className="h-8 px-1 text-muted-foreground hover:text-primary"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {arrangedWords.length === 0 && (
            <p className="text-muted-foreground text-sm w-full text-center">
              Click words below to add them to your sentence
            </p>
          )}
        </div>
      </div>

      {/* Available words area */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Available words:</p>
        <div className="flex flex-wrap gap-3 min-h-[80px] items-center bg-muted/30 rounded-lg p-4">
          {remainingWords.map((word, index) => (
            <div
              key={index}
              onClick={() => handleAddWord(word, index)}
              className="px-4 py-2 rounded-lg bg-card text-card-foreground text-lg font-medium hover:bg-accent cursor-pointer transition-colors"
            >
              {word}
            </div>
          ))}
          {remainingWords.length === 0 && (
            <p className="text-muted-foreground text-sm w-full text-center">
              No more words available
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          {hasSubmitted ? (
            isCorrect ? (
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span>Correct! Moving to next question...</span>
              </div>
            ) : (
              <p className="text-red-500">
                Incorrect. Try rearranging the words and submit again.
              </p>
            )
          ) : arrangedWords.length > 0 ? (
            <p className="text-muted-foreground">
              Click Submit when you're ready to check your answer
            </p>
          ) : (
            <p className="text-muted-foreground">
              Click words to build your sentence
            </p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          className="h-12 px-8 text-lg bg-primary/10 hover:bg-primary/20 text-primary"
          disabled={arrangedWords.length === 0 || hasSubmitted}
        >
          <span>Submit Answer</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
} 