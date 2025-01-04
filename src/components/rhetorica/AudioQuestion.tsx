import { Button } from "@/components/ui/button";
import { Mic, PlayCircle, StopCircle, Volume2 } from "lucide-react";
import { useRef } from "react";

interface AudioQuestionProps {
  audio: string;
  text: string;
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlayComplete: () => void;
  timeLeft: number;
}

export function AudioQuestion({
  audio,
  text,
  isRecording,
  isPlaying,
  onRecord,
  onPlayComplete,
  timeLeft,
}: AudioQuestionProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="space-y-6">
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
      <p className="text-muted-foreground text-lg italic text-center">
        {text}
      </p>
      <div className="flex justify-center">
        <Button
          className={`h-16 text-lg ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
          } transition-colors`}
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