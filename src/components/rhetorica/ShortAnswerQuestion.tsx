import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play } from "lucide-react";
import { SpeechEvaluationService } from "@/services/speechEvaluationService";

interface ShortAnswerQuestionProps {
  audio: string;
  text: string;
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlayComplete: () => void;
  timeLeft: number;
  onEvaluationComplete: (scores: { pronunciation: number; fluency: number; transcript: string }) => void;
  recordedBlob?: Blob;
}

export function ShortAnswerQuestion({
  audio,
  text,
  isRecording,
  isPlaying,
  onRecord,
  onPlayComplete,
  timeLeft,
  onEvaluationComplete,
  recordedBlob
}: ShortAnswerQuestionProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const speechEvaluationService = new SpeechEvaluationService();

  useEffect(() => {
    if (recordedBlob) {
      handleEvaluation();
    }
  }, [recordedBlob]);

  const handleEvaluation = async () => {
    if (!recordedBlob) return;

    try {
      console.log("Starting short answer evaluation:", {
        blobSize: recordedBlob.size,
        blobType: recordedBlob.type
      });

      const scores = await speechEvaluationService.evaluateOpenEndedSpeech(recordedBlob);

      console.log("Short answer evaluation completed:", {
        scores
      });

      onEvaluationComplete(scores);
    } catch (error) {
      console.error("Error evaluating short answer:", error);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Listen and answer the question</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>

      <audio
        ref={audioRef}
        src={audio}
        onEnded={onPlayComplete}
        className="w-full"
      />

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePlay}
          disabled={isRecording}
        >
          <Play className="w-5 h-5 mr-2" />
          Play Audio
        </Button>

        <Button
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          onClick={onRecord}
          disabled={isPlaying}
        >
          {isRecording ? (
            <>
              <Square className="w-5 h-5 mr-2" />
              Stop Recording ({timeLeft}s)
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 