"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Power } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RTClient,
  RTInputAudioItem,
  RTResponse,
} from "rt-client";
import { AudioHandler } from "@/lib/audio";

interface Message {
  type: "user" | "assistant" | "status";
  content: string;
}


const ChatInterface = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [useVAD] = useState(true);
  const clientRef = useRef<RTClient | null>(null);
  const audioHandlerRef = useRef<AudioHandler | null>(null);

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

        await clientRef.current.sendItem({
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: currentMessage }],
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="border-b dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sticky top-0 z-10">
          <Button
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2"
            variant={isConnected ? "destructive" : "default"}
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <Power className="w-4 h-4" />
            {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 rounded-bl-none"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyUp={(e) => e.key === "Enter" && sendMessage()}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={toggleRecording}
              className={`${
                isRecording 
                  ? "bg-destructive/10 hover:bg-destructive/20 text-destructive" 
                  : ""
              }`}
              disabled={!isConnected}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button 
              onClick={sendMessage} 
              disabled={!isConnected || !currentMessage.trim()}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;