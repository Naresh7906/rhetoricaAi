"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Power, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  RTClient,
  RTInputAudioItem,
  RTResponse,
} from "rt-client";
import { AudioHandler } from "@/lib/audio";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface Message {
  type: "user" | "assistant" | "status";
  content: string;
}

const ChatInterface = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [useVAD] = useState(true);
  const clientRef = useRef<RTClient | null>(null);
  const audioHandlerRef = useRef<AudioHandler | null>(null);
  const [backstory, setBackstory] = useState("");
  const [showBackstory, setShowBackstory] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);

  const handleConnect = async () => {
    if (!isConnected) {
      try {
        setIsConnecting(true);
        clientRef.current = new RTClient(
          new URL(import.meta.env.VITE_AZURE_OPENAI_ENDPOINT!),
          { key: import.meta.env.VITE_AZURE_OPENAI_API_KEY! },
          { deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME! }
        );

        clientRef.current.configure({
          input_audio_transcription: { model: "whisper-1" },
          turn_detection: { type: "server_vad" },
          modalities: ["text", "audio"],
        });
        startResponseListener();

        setIsConnected(true);
      } catch (error) {
        console.error("Connection failed:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      await disconnect();
    }
  };

  const disconnect = async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.close();
        clientRef.current = null;
        setIsConnected(false);
      } catch (error) {
        console.error("Disconnect failed:", error);
      }
    }
  };

  const handleResponse = async (response: RTResponse) => {
    for await (const item of response) {
      if (item.type === "message" && item.role === "assistant") {
        const message: Message = {
          type: item.role,
          content: "",
        };
        setMessages((prevMessages) => [...prevMessages, message]);
        for await (const content of item) {
          if (content.type === "text") {
            for await (const text of content.textChunks()) {
              message.content += text;
              setMessages((prevMessages) => {
                prevMessages[prevMessages.length - 1].content = message.content;
                return [...prevMessages];
              });
            }
          } else if (content.type === "audio") {
            const textTask = async () => {
              for await (const text of content.transcriptChunks()) {
                message.content += text;
                setMessages((prevMessages) => {
                  prevMessages[prevMessages.length - 1].content =
                    message.content;
                  return [...prevMessages];
                });
              }
            };
            const audioTask = async () => {
              audioHandlerRef.current?.startStreamingPlayback();
              for await (const audio of content.audioChunks()) {
                audioHandlerRef.current?.playChunk(audio);
              }
            };
            await Promise.all([textTask(), audioTask()]);
          }
        }
      }
    }
  };

  const handleInputAudio = async (item: RTInputAudioItem) => {
    audioHandlerRef.current?.stopStreamingPlayback();
    await item.waitForCompletion();
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type: "user",
        content: item.transcription || "",
      },
    ]);
  };

  const startResponseListener = async () => {
    if (!clientRef.current) return;

    try {
      for await (const serverEvent of clientRef.current.events()) {
        if (serverEvent.type === "response") {
          await handleResponse(serverEvent);
        } else if (serverEvent.type === "input_audio") {
          await handleInputAudio(serverEvent);
        }
      }
    } catch (error) {
      if (clientRef.current) {
        console.error("Response iteration error:", error);
      }
    }
  };

  const sendMessage = async () => {
    if (currentMessage.trim() && clientRef.current) {
      try {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "user",
            content: currentMessage,
          },
        ]);

        const messageContent = backstory && messages.length === 0
          ? `[System: ${backstory}]\n\nUser: ${currentMessage}`
          : currentMessage;

        await clientRef.current.sendItem({
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: messageContent }],
        });
        await clientRef.current.generateResponse();
        setCurrentMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const toggleRecording = async () => {
    if (!isRecording && clientRef.current) {
      try {
        if (!audioHandlerRef.current) {
          audioHandlerRef.current = new AudioHandler();
          await audioHandlerRef.current.initialize();
        }
        await audioHandlerRef.current.startRecording(async (chunk) => {
          await clientRef.current?.sendAudio(chunk);
        });
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    } else if (audioHandlerRef.current) {
      try {
        audioHandlerRef.current.stopRecording();
        if (!useVAD) {
          const inputAudio = await clientRef.current?.commitAudio();
          await handleInputAudio(inputAudio!);
          await clientRef.current?.generateResponse();
        }
        setIsRecording(false);
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
  };

  useEffect(() => {
    const initAudioHandler = async () => {
      const handler = new AudioHandler();
      await handler.initialize();
      audioHandlerRef.current = handler;
    };

    initAudioHandler().catch(console.error);

    return () => {
      disconnect();
      audioHandlerRef.current?.close().catch(console.error);
    };
  }, []);

  // Initialize video feed
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsVideoAvailable(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setIsVideoAvailable(false);
      }
    };

    startVideo();

    // Cleanup
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsVideoAvailable(false);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                  R
                </div>
                <span className="text-xl font-semibold gradient-text">Rhetorica</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-2 border-l pl-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Panel - Chat */}
        <div className="w-[400px] border-r bg-muted/5 flex flex-col">
          <div className="p-4 border-b bg-background">
            <h2 className="text-lg font-semibold">Voice Training Chat</h2>
            <p className="text-sm text-muted-foreground">Practice your communication skills</p>
          </div>
          
          <div className="flex-1 flex overflow-y-auto flex-col p-4">
            {/* Connect Button */}
            <Button
              className={cn(
                "mb-4",
                isConnected ? "bg-destructive hover:bg-destructive/90" : "gradient-bg"
              )}
              onClick={handleConnect}
              disabled={isConnecting}
            >
              <Power className="w-4 h-4 mr-2" />
              {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
            </Button>

            {/* Backstory Section */}
            <Card className="mb-4 border-muted/20">
              <div className="p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm">AI Backstory</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBackstory(!showBackstory)}
                    className="h-8"
                  >
                    {showBackstory ? "Hide" : "Show"}
                  </Button>
                </div>
                {showBackstory && (
                  <>
                    <Textarea
                      placeholder="Enter the AI's backstory and personality..."
                      value={backstory}
                      onChange={(e) => setBackstory(e.target.value)}
                      className="min-h-[80px] resize-none text-sm"
                      disabled={messages.length > 0}
                    />
                    {messages.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Backstory can only be set before starting a conversation.
                      </p>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Messages Area */}
            <div className="space-y-4 overflow-y-scroll mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={cn(
                      "p-3 rounded-lg max-w-[85%] text-sm",
                      message.type === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted/50 rounded-bl-none"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-2 bg-background p-3 rounded-lg border shadow-sm">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyUp={(e) => e.key === "Enter" && sendMessage()}
                disabled={!isConnected}
                className="flex-1 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={toggleRecording}
                className={cn(
                  "transition-colors",
                  isRecording && "bg-destructive/10 hover:bg-destructive/20 text-destructive"
                )}
                disabled={!isConnected}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <Button 
                size="icon"
                onClick={sendMessage} 
                disabled={!isConnected || !currentMessage.trim()}
                className="gradient-bg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Canvas Area */}
        <div className="flex-1 grid grid-cols-2 gap-6 p-6 bg-background/50">
          {/* Middle Section */}
          <div className="aspect-square rounded-xl border-2 border-dashed border-muted flex items-center justify-center">
            <div className="text-center p-6">
              <h3 className="font-semibold mb-2">Gesture Analysis</h3>
              <p className="text-sm text-muted-foreground">Visual feedback will appear here during the conversation</p>
            </div>
          </div>

          {/* Right Section - Video Feed */}
          <div className="aspect-square rounded-xl border-2 border-dashed border-muted overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!isVideoAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <p className="text-sm">Camera Feed Unavailable</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;