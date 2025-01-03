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

export interface Message {
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
  const [backstory, setBackstory] = useState(`Your Name: Rajesh Kumar from TechNova Solutions

Background: You are Rajesh Kumar, a senior IT consultant at TechNova Solutions, a global IT consulting firm. You're exploring advanced AI solutions to enhance your service portfolio.

Objective: Evaluate our generative AI model to address business challenges and create value for your clients.

Key Areas of Interest:

Customer Support Automation
Data Analysis and Insights
Content Generation
Process Optimization
Expectations:

Detailed demo showcasing practical applications.
Customization to meet specific needs.
Integration with existing systems.
Insights into implementation, ROI, and support services.
Conversation Flow:

Introduction: Introduce yourself and your role.
Objective: State your objective and areas of interest.
Questions: Ask about customization and integration.
Implementation: Inquire about the process and ROI.
Support: Ask about support services.
Conclusion: Summarize takeaways and discuss next steps.`);
  const [showGetStarted, setShowGetStarted] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleConnect = async () => {
    if (!isConnected) {
      try {
        setIsConnecting(true);
        clientRef.current = new RTClient(
          new URL(import.meta.env.VITE_AZURE_OPENAI_ENDPOINT!),
          { key: import.meta.env.VITE_AZURE_OPENAI_API_KEY! },
          { deployment: import.meta.env.VITE_AZURE_OPENAI_VOICE_DEPLOYMENT_NAME! }
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
          if (content.type === "audio") {
            setIsAISpeaking(true);
            const textTask = async () => {
              for await (const text of content.transcriptChunks()) {
                message.content += text;
                setMessages((prevMessages) => {
                  prevMessages[prevMessages.length - 1].content = message.content;
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
            setIsAISpeaking(false);
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

  // Modify handleGetStarted to automatically send initial message
  const handleGetStarted = async () => {
    setShowGetStarted(false);
    await handleConnect();
    
    // Wait for connection to establish
    setTimeout(async () => {
      if (clientRef.current) {
        const messageContent = `[System: ${backstory}]\n\nUser: Hi`;
        
        await clientRef.current.sendItem({
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: messageContent }],
        });
        
        setMessages(prev => [...prev, { type: "user", content: "Hi" }]);
        await clientRef.current.generateResponse();
      }
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEndConversation = async () => {
    if (clientRef.current) {
      await disconnect();
      navigate('/employee/conversation-report', {
        state: { conversationContext: messages }
      });
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="border-b bg-card/50 backdrop-blur-sm z-50">
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
              <Button
                variant="destructive"
                onClick={handleEndConversation}
                disabled={!isConnected}
                className="gap-2"
              >
                <Power className="h-4 w-4" />
                End Session
              </Button>
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
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Transcript */}
        <div className="w-[400px] border-r bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b flex-shrink-0">
            <h2 className="text-lg font-semibold">Conversation Transcript</h2>
            <p className="text-sm text-muted-foreground">Your training session progress</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    message.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">AI</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 max-w-[85%]",
                      message.type === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  {message.type === "user" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src="/avatar.jpg" alt="You" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 relative bg-gradient-to-b from-background to-muted/10">
          {/* AI Avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-card border-4 border-primary/20 flex items-center justify-center relative">
              <div className="text-4xl font-bold gradient-text">AI</div>
              {isAISpeaking && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/95 px-3 py-1 rounded-full shadow-lg border">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium">Speaking...</span>
                </div>
              )}
            </div>
          </div>

          {/* User Video */}
          <div className="absolute bottom-8 right-8 w-72 aspect-video rounded-2xl overflow-hidden border-4 border-background shadow-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <p className="text-sm">Camera Feed Unavailable</p>
              </div>
            )}
          </div>

          {/* Microphone Control */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={toggleRecording}
              className={cn(
                "h-16 w-16 rounded-full shadow-lg",
                isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary"
              )}
              disabled={!isConnected}
            >
              {isRecording ? (
                <MicOff className="w-7 h-7" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Get Started Modal */}
      {showGetStarted && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-8 rounded-xl shadow-lg max-w-md w-full mx-4 border">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center">Welcome to Voice Training</h2>
            <p className="text-muted-foreground text-center mb-8">
              Ready to start your voice training session? Click below to begin the conversation.
            </p>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;