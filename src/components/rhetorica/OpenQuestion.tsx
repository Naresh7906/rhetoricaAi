import { Button } from "@/components/ui/button";
import { Mic, StopCircle } from "lucide-react";

interface OpenQuestionProps {
  text: string;
  isRecording: boolean;
  onRecord: () => void;
  timeLeft: number;
}

export function OpenQuestion({
  text,
  isRecording,
  onRecord,
  timeLeft,
}: OpenQuestionProps) {
  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="space-y-4">
        <p className="text-xl leading-relaxed">
          {text}
        </p>
        <p className="text-muted-foreground text-lg text-center">
          Take a moment to think about your answer, then click Record when ready
        </p>
      </div>

      {/* Recording section */}
      <div className="flex justify-center">
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
    </div>
  );
} 