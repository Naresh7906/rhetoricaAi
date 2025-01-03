import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { analyzeConversation } from "@/services/conversationService";
import { Message } from "./voice-model";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ConversationMetrics {
  overallPerformance: number;
  summary: string;
  softSkills: {
    empathy: number;
    professionalism: number;
    communication: number;
    conflictResolution: number;
  };
  keyAreas: {
    strengths: string[];
    improvementAreas: string[];
  };
  scenarioHandling: {
    situationAwareness: number;
    solutionEffectiveness: number;
    stressManagement: number;
  };
  actionableRecommendations: string[];
}

export default function ConversationReport() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<ConversationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { conversationContext } = location.state || { conversationContext: [] as Message[] };

  useEffect(() => {
    const getAnalysis = async () => {
      try {
        const analysis = await analyzeConversation(
          conversationContext,
          import.meta.env.VITE_AZURE_OPENAI_GENERAL_DEPLOYMENT_NAME
        );
        setMetrics(analysis);
      } catch (error) {
        console.error("Error getting conversation analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationContext?.length > 0) {
      getAnalysis();
    } else {
      setLoading(false);
    }
  }, [conversationContext]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading analysis...</div>;
  }

  if (!metrics) {
    return <div className="flex items-center justify-center min-h-screen">No data available</div>;
  }

  const softSkillsData = [
    { skill: "Empathy", value: metrics.softSkills.empathy },
    { skill: "Professionalism", value: metrics.softSkills.professionalism },
    { skill: "Communication", value: metrics.softSkills.communication },
    { skill: "Conflict Resolution", value: metrics.softSkills.conflictResolution },
  ];

  const scenarioData = [
    { name: "Situation Awareness", score: metrics.scenarioHandling.situationAwareness },
    { name: "Solution Effectiveness", score: metrics.scenarioHandling.solutionEffectiveness },
    { name: "Stress Management", score: metrics.scenarioHandling.stressManagement },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Performance Report</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                Overall Score: {metrics.overallPerformance}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
          <p className="text-gray-700 dark:text-gray-300">{metrics.summary}</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Soft Skills Analysis</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={softSkillsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Scenario Handling</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#82ca9d" name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Key Areas</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-green-600 dark:text-green-400 mb-2">Strengths</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {metrics.keyAreas.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-orange-600 dark:text-orange-400 mb-2">Areas for Improvement</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {metrics.keyAreas.improvementAreas.map((area, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Actionable Recommendations</h2>
            <ul className="list-decimal pl-6 space-y-2">
              {metrics.actionableRecommendations.map((recommendation, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {recommendation}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
} 