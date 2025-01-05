import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, PlayCircle, StopCircle, Volume2, Check } from "lucide-react";

interface SentenceCompletionQuestionProps {
  text: string;
  audio: string;
  solution: string;
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlayComplete: () => void;
  timeLeft: number;
  onComplete: (textAnswer: string, audioBlob: Blob, isCorrect: boolean, attempts: number) => void;
}

export function SentenceCompletionQuestion({
  text,
  audio,
  solution,
  isRecording,
  isPlaying,
  onRecord,
  onPlayComplete,
  timeLeft,
  onComplete,
}: SentenceCompletionQuestionProps) {
  const [answer, setAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const isCorrect = solution.toLowerCase().split("/").some(
    possibleAnswer => answer.toLowerCase().trim() === possibleAnswer.trim()
  );

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (isCorrect && onComplete) {
      setTimeout(onComplete, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Audio playback */}
      <Button
        variant="outline"
        className="w-full h-20 text-lg hover:bg-purple-500/5"
        onClick={handlePlayAudio}
        disabled={isPlaying || isRecording}
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
        src={audio}
        onEnded={onPlayComplete}
        className="hidden"
      />

      {/* Question text */}
      <div className="space-y-4">
        <p className="text-xl leading-relaxed">{text}</p>
        <div className="flex gap-4">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="text-lg"
            disabled={hasSubmitted}
          />
          {!hasSubmitted && (
            <Button
              onClick={handleSubmit}
              className="px-8 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Feedback and recording */}
      {hasSubmitted && (
        <div className="space-y-4">
          {isCorrect ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span>Correct! Now record your answer.</span>
              </div>
              <Button
                className={`h-16 text-lg ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-purple-600 hover:bg-purple-700"
                } text-white transition-colors`}
                onClick={onRecord}
              >
                {isRecording ? (
                  <>
                    <StopCircle className="w-6 h-6 mr-2" />
                    Stop Recording ({timeLeft}s)
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center text-red-500">
              <p>Incorrect. Try again.</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setAnswer("");
                  setHasSubmitted(false);
                }}
                className="mt-2"
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 