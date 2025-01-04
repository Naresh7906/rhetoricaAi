import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle } from "lucide-react";
import { SpeechEvaluationService } from "@/services/speechEvaluationService";

interface ReadAloudQuestionProps {
  text: string;
  isRecording: boolean;
  onRecord: () => void;
  timeLeft: number;
  onEvaluationComplete?: (scores: { pronunciation: number; fluency: number; transcript: string }) => void;
  recordedBlob?: Blob;
}

export function ReadAloudQuestion({
  text,
  isRecording,
  onRecord,
  timeLeft,
  onEvaluationComplete,
  recordedBlob
}: ReadAloudQuestionProps) {
  const evaluationService = useRef(new SpeechEvaluationService());

  // Evaluate recording when blob is available
  useEffect(() => {
    async function evaluateRecording() {
      if (recordedBlob && !isRecording && onEvaluationComplete) {
        try {
          console.log("Starting read aloud evaluation:", {
            blobSize: recordedBlob.size,
            blobType: recordedBlob.type,
            referenceText: text
          });

          const scores = await evaluationService.current.evaluateReading(recordedBlob, text);
          
          console.log("Read aloud evaluation completed:", {
            scores,
            referenceText: text
          });
          
          onEvaluationComplete(scores);
        } catch (error) {
          console.error("Error evaluating read aloud:", error);
          // Call onEvaluationComplete with default scores on error
          onEvaluationComplete({ pronunciation: 0, fluency: 0, transcript: "" });
        }
      }
    }

    evaluateRecording();
  }, [recordedBlob, isRecording, text, onEvaluationComplete]);

  return (
    <div className="space-y-6">
      <p className="text-xl leading-relaxed">{text}</p>
      <div className="flex justify-center">
        <Button
          className={`h-16 text-lg ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
          } transition-colors`}
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