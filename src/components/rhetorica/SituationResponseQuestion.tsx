import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, PlayCircle, StopCircle, Volume2 } from "lucide-react";

interface SituationResponseQuestionProps {
  audio: string;
  text: string;
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlayComplete: () => void;
  timeLeft: number;
}

export function SituationResponseQuestion({
  audio,
  text,
  isRecording,
  isPlaying,
  onRecord,
  onPlayComplete,
  timeLeft,
}: SituationResponseQuestionProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
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

      {/* Situation description */}
      <div className="space-y-4">
        <p className="text-xl leading-relaxed text-center">
          {text}
        </p>
        <p className="text-muted-foreground text-lg text-center">
          Listen to the situation and respond appropriately
        </p>
      </div>

      {/* Recording section */}
      <div className="flex flex-col items-center gap-4">
        <Button
          className={`h-16 text-lg ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white transition-colors`}
          onClick={onRecord}
          disabled={isPlaying}
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