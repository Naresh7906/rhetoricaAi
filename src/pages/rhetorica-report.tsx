import { useEffect, useState } from "react";
import { useRhetorica } from "@/contexts/rhetorica-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Answer {
  scores?: {
    pronunciation?: number;
    fluency?: number;
    accuracy?: number;
    phonetic?: number;
    transcript?: string;
  };
  isCorrect?: boolean;
  attempts?: number;
}

interface ScoreAccumulator {
  pronunciation: number;
  fluency: number;
  accuracy: number;
  phonetic: number;
  count: number;
}

interface FormationAccumulator {
  sentenceMastery: number;
  attempts: number;
  count: number;
}

interface SectionScore {
  pronunciation: number;
  fluency: number;
  accuracy: number;
  phonetic: number;
}

interface FormationScore {
  sentenceMastery: number;
  attempts: number;
}

interface TestResults {
  sectionA: SectionScore;
  sectionB: SectionScore;
  sectionC: SectionScore;
  sectionD: FormationScore;
}

export function RhetoricaReport() {
  const navigate = useNavigate();
  const { answers } = useRhetorica();
  const [results, setResults] = useState<TestResults>({
    sectionA: { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0 },
    sectionB: { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0 },
    sectionC: { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0 },
    sectionD: { sentenceMastery: 0, attempts: 0 },
  });

  useEffect(() => {
    // Calculate section scores from answers
    const calculateSectionScores = () => {
      const newResults = { ...results };

      // Process Section A (Reading)
      if (answers[0]) {
        const sectionAScores = Object.values(answers[0]).reduce(
          (acc: ScoreAccumulator, answer: Answer) => {
            if (answer.scores) {
              acc.pronunciation += answer.scores.pronunciation || 0;
              acc.fluency += answer.scores.fluency || 0;
              acc.accuracy += answer.scores.accuracy || 0;
              acc.phonetic += answer.scores.phonetic || 0;
              acc.count += 1;
            }
            return acc;
          },
          { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0, count: 0 }
        );

        if (sectionAScores.count > 0) {
          newResults.sectionA = {
            pronunciation: Math.round(sectionAScores.pronunciation / sectionAScores.count),
            fluency: Math.round(sectionAScores.fluency / sectionAScores.count),
            accuracy: Math.round(sectionAScores.accuracy / sectionAScores.count),
            phonetic: Math.round(sectionAScores.phonetic / sectionAScores.count),
          };
        }
      }

      // Process Section B (Listening)
      if (answers[1]) {
        const sectionBScores = Object.values(answers[1]).reduce(
          (acc: ScoreAccumulator, answer: Answer) => {
            if (answer.scores) {
              acc.pronunciation += answer.scores.pronunciation || 0;
              acc.fluency += answer.scores.fluency || 0;
              acc.accuracy += answer.scores.accuracy || 0;
              acc.phonetic += answer.scores.phonetic || 0;
              acc.count += 1;
            }
            return acc;
          },
          { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0, count: 0 }
        );

        if (sectionBScores.count > 0) {
          newResults.sectionB = {
            pronunciation: Math.round(sectionBScores.pronunciation / sectionBScores.count),
            fluency: Math.round(sectionBScores.fluency / sectionBScores.count),
            accuracy: Math.round(sectionBScores.accuracy / sectionBScores.count),
            phonetic: Math.round(sectionBScores.phonetic / sectionBScores.count),
          };
        }
      }

      // Process Section C (Speaking)
      if (answers[2]) {
        const sectionCScores = Object.values(answers[2]).reduce(
          (acc: ScoreAccumulator, answer: Answer) => {
            if (answer.scores) {
              acc.pronunciation += answer.scores.pronunciation || 0;
              acc.fluency += answer.scores.fluency || 0;
              acc.accuracy += answer.scores.accuracy || 0;
              acc.phonetic += answer.scores.phonetic || 0;
              acc.count += 1;
            }
            return acc;
          },
          { pronunciation: 0, fluency: 0, accuracy: 0, phonetic: 0, count: 0 }
        );

        if (sectionCScores.count > 0) {
          newResults.sectionC = {
            pronunciation: Math.round(sectionCScores.pronunciation / sectionCScores.count),
            fluency: Math.round(sectionCScores.fluency / sectionCScores.count),
            accuracy: Math.round(sectionCScores.accuracy / sectionCScores.count),
            phonetic: Math.round(sectionCScores.phonetic / sectionCScores.count),
          };
        }
      }

      // Process Section D (Formation)
      if (answers[3]) {
        const sectionDScores = Object.values(answers[3]).reduce(
          (acc: FormationAccumulator, answer: Answer) => {
            if (answer.isCorrect !== undefined) {
              acc.sentenceMastery += answer.isCorrect
                ? Math.max(100 - (answer.attempts! - 1) * 20, 20)
                : 0;
              acc.attempts += answer.attempts || 0;
              acc.count += 1;
            }
            return acc;
          },
          { sentenceMastery: 0, attempts: 0, count: 0 }
        );

        if (sectionDScores.count > 0) {
          newResults.sectionD = {
            sentenceMastery: Math.round(sectionDScores.sentenceMastery / sectionDScores.count),
            attempts: Math.round((sectionDScores.attempts / sectionDScores.count) * 10) / 10,
          };
        }
      }

      setResults(newResults);
    };

    calculateSectionScores();
  }, [answers]);

  const overallScore = Math.round(
    (results.sectionA.pronunciation +
      results.sectionA.fluency +
      results.sectionB.pronunciation +
      results.sectionB.fluency +
      results.sectionC.pronunciation +
      results.sectionC.fluency +
      results.sectionD.sentenceMastery) /
      7
  );

  const radarData = [
    {
      metric: "Reading",
      score: Math.round(
        (results.sectionA.pronunciation +
          results.sectionA.fluency +
          results.sectionA.accuracy +
          results.sectionA.phonetic) /
          4
      ),
    },
    {
      metric: "Listening",
      score: Math.round(
        (results.sectionB.pronunciation +
          results.sectionB.fluency +
          results.sectionB.accuracy +
          results.sectionB.phonetic) /
          4
      ),
    },
    {
      metric: "Speaking",
      score: Math.round(
        (results.sectionC.pronunciation +
          results.sectionC.fluency +
          results.sectionC.accuracy +
          results.sectionC.phonetic) /
          4
      ),
    },
    {
      metric: "Formation",
      score: results.sectionD.sentenceMastery,
    },
  ];

  const detailedScores = [
    {
      name: "Pronunciation",
      A: results.sectionA.pronunciation,
      B: results.sectionB.pronunciation,
      C: results.sectionC.pronunciation,
    },
    {
      name: "Fluency",
      A: results.sectionA.fluency,
      B: results.sectionB.fluency,
      C: results.sectionC.fluency,
    },
    {
      name: "Accuracy",
      A: results.sectionA.accuracy,
      B: results.sectionB.accuracy,
      C: results.sectionC.accuracy,
    },
    {
      name: "Phonetic",
      A: results.sectionA.phonetic,
      B: results.sectionB.phonetic,
      C: results.sectionC.phonetic,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden p-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-background" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      <div className="relative z-10 container mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-purple-500 dark:text-purple-400">
            Rhetorica Test Results
          </h1>
          <p className="text-xl text-muted-foreground">
            Overall Score: {overallScore}%
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>Performance across all sections</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Scores</CardTitle>
              <CardDescription>Breakdown by metric and section</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detailedScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="A" name="Reading" fill="#8b5cf6" />
                  <Bar dataKey="B" name="Listening" fill="#6366f1" />
                  <Bar dataKey="C" name="Speaking" fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Section Specific Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Formation Performance</CardTitle>
              <CardDescription>Section D Metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sentence Mastery
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${results.sectionD.sentenceMastery}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {results.sectionD.sentenceMastery}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Attempts
                  </p>
                  <p className="text-2xl font-bold">
                    {results.sectionD.attempts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips and Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Areas for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.sectionA.pronunciation < 70 && (
                  <li className="text-muted-foreground">
                    • Focus on improving pronunciation in reading exercises
                  </li>
                )}
                {results.sectionB.fluency < 70 && (
                  <li className="text-muted-foreground">
                    • Practice listening and repeating to enhance fluency
                  </li>
                )}
                {results.sectionC.accuracy < 70 && (
                  <li className="text-muted-foreground">
                    • Work on speaking accuracy with structured responses
                  </li>
                )}
                {results.sectionD.sentenceMastery < 70 && (
                  <li className="text-muted-foreground">
                    • Review sentence structure and word order rules
                  </li>
                )}
                {overallScore >= 70 && (
                  <li className="text-muted-foreground">
                    • Great job! Keep practicing to maintain your skills
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Done Button */}
        <div className="flex justify-center pt-8">
          <Button
            className="h-12 px-8 text-lg bg-primary/10 hover:bg-primary/20 text-primary"
            onClick={() => navigate("/employee/dashboard")}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
} 