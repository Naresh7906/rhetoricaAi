import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X, Send } from "lucide-react";
import type { Course } from "@/services/courseService";
import type { AllCourse } from "@/services/allCoursesService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { Components } from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RhetoricaChatPopupProps {
  course?: Course;
  allCourse?: AllCourse;
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const isInline = !props.node?.properties?.className;
    return (
      <code
        className={`${className || ''} ${
          isInline ? "bg-muted-foreground/20 rounded px-1" : 
          "block bg-muted-foreground/10 p-2 rounded-md"
        }`}
        {...props}
      >
        {children}
      </code>
    );
  },
  a(props) {
    return (
      <a
        className="text-purple-400 hover:text-purple-300 underline"
        {...props}
      />
    );
  },
};

export function RhetoricaChatPopup({ course, allCourse }: RhetoricaChatPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseDetails = course || allCourse;

  const getSystemMessage = () => {
    if (!courseDetails) return "You are Rhetorica AI, a helpful assistant that helps students with their course-related questions.";

    return `You are Rhetorica AI, a helpful assistant that helps students with their course-related questions.
Course Title: ${courseDetails.title}
Course Description: ${courseDetails.description}
Course Category: ${courseDetails.category}
Author: ${courseDetails.author.name} (${courseDetails.author.role})
Number of Chapters: ${courseDetails.chapters.length}
Chapters: ${courseDetails.chapters.map(ch => `\n- ${ch.title}`).join('')}

Please use this course information to provide relevant and contextual answers to the student's questions. If they ask about specific chapters or topics, refer to the actual course content in your responses. Format your responses using markdown for better readability.`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(import.meta.env.VITE_AZURE_OPENAI_ENDPOINT + "openai/deployments/" + 
        import.meta.env.VITE_AZURE_OPENAI_GENERAL_DEPLOYMENT_NAME + "/chat/completions?api-version=2024-02-15-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": import.meta.env.VITE_AZURE_OPENAI_API_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: getSystemMessage() },
            ...messages,
            userMessage,
          ],
          max_tokens: 800,
          temperature: 0.7,
          frequency_penalty: 0,
          presence_penalty: 0,
          top_p: 0.95,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      // Remove the user's message if the API call failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 bg-purple-600 hover:bg-purple-700"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      ) : (
        <Card className="w-[400px] h-[600px] flex flex-col">
          <div className="p-4 border-b flex items-center justify-between bg-card">
            <h3 className="font-semibold">Ask Rhetorica about {courseDetails?.title || 'the course'}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  Ask any questions about {courseDetails?.title || 'the course'} and I'll help you understand it better!
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={markdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    Thinking...
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center">
                  <div className="max-w-[80%] rounded-lg p-3 bg-red-100 text-red-600 text-sm">
                    {error}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder={`Ask anything about ${courseDetails?.title || 'the course'}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 