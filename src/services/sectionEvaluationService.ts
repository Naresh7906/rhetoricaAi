import { Section, AudioAnswer, TextQuestion, AudioQuestion, SentenceBuildAnswer, SentenceBuildQuestion } from "@/types/rhetorica";
import { SpeechEvaluationService } from "./speechEvaluationService";

interface EvaluationResult {
  questionNumber: number;
  referenceText?: string;
  transcript?: string;
  userAnswer?: string;
  solution?: string;
  scores: {
    pronunciation?: number;
    fluency?: number;
    accuracy?: number;
    phonetic?: number;
    sentenceMastery?: number;
    attempts?: number;
  };
}

interface SectionAnswers {
  [key: string]: AudioAnswer | SentenceBuildAnswer;
}

interface EvaluationScores {
  pronunciation: number;
  fluency: number;
  accuracy: number;
  phonetic: number;
  transcript: string;
}

export class SectionEvaluationService {
  constructor(private speechEvaluationService: SpeechEvaluationService) {}

  async evaluateReadingSection(
    section: Section,
    sectionAnswers: SectionAnswers,
    updateScores: (sectionIndex: number, questionIndex: number, scores: EvaluationScores) => void,
    sectionIndex: number
  ) {
    const evaluationResults: EvaluationResult[] = [];
    let hasReadAloudAnswers = false;

    for (const [questionIndex, answer] of Object.entries(sectionAnswers)) {
      if (answer.questionType === "Read Aloud") {
        hasReadAloudAnswers = true;
        const audioAnswer = answer as AudioAnswer;
        const question = section.questions[parseInt(questionIndex)] as TextQuestion;

        if (audioAnswer.scores?.pronunciation !== undefined && audioAnswer.scores?.fluency !== undefined) {
          evaluationResults.push(this.createEvaluationResult(parseInt(questionIndex), question.text, audioAnswer));
          continue;
        }

        try {
          const scores = await this.speechEvaluationService.evaluateReading(audioAnswer.audioBlob, question.text);
          updateScores(sectionIndex, parseInt(questionIndex), scores);
          evaluationResults.push(this.createFullEvaluationResult(parseInt(questionIndex), question.text, scores));
        } catch (error) {
          console.error(`Error evaluating question ${parseInt(questionIndex) + 1}:`, error);
        }
      }
    }

    return { evaluationResults, hasReadAloudAnswers };
  }

  async evaluateListeningSection(
    section: Section,
    sectionAnswers: SectionAnswers,
    updateScores: (sectionIndex: number, questionIndex: number, scores: EvaluationScores) => void,
    sectionIndex: number
  ) {
    const evaluationResults: EvaluationResult[] = [];
    let hasRepeatSentenceAnswers = false;

    for (const [questionIndex, answer] of Object.entries(sectionAnswers)) {
      if (answer.questionType === "Repeat Sentence") {
        hasRepeatSentenceAnswers = true;
        const audioAnswer = answer as AudioAnswer;
        const question = section.questions[parseInt(questionIndex)] as AudioQuestion;

        if (audioAnswer.scores?.pronunciation !== undefined && audioAnswer.scores?.fluency !== undefined) {
          evaluationResults.push(this.createEvaluationResult(parseInt(questionIndex), question.solution, audioAnswer));
          continue;
        }

        try {
          const scores = await this.speechEvaluationService.evaluateReading(audioAnswer.audioBlob, question.solution);
          updateScores(sectionIndex, parseInt(questionIndex), scores);
          evaluationResults.push(this.createFullEvaluationResult(parseInt(questionIndex), question.solution, scores));
        } catch (error) {
          console.error(`Error evaluating question ${parseInt(questionIndex) + 1}:`, error);
        }
      }
    }

    return { evaluationResults, hasRepeatSentenceAnswers };
  }

  evaluateFormationSection(
    section: Section,
    sectionAnswers: SectionAnswers
  ) {
    const evaluationResults: EvaluationResult[] = [];
    let hasSentenceBuildAnswers = false;

    for (const [questionIndex, answer] of Object.entries(sectionAnswers)) {
      if (answer.questionType === "Sentence Build") {
        hasSentenceBuildAnswers = true;
        const buildAnswer = answer as SentenceBuildAnswer;
        const question = section.questions[parseInt(questionIndex)] as SentenceBuildQuestion;

        const sentenceMastery = buildAnswer.isCorrect ? 
          Math.max(100 - ((buildAnswer.attempts - 1) * 20), 20) : 
          0;

        evaluationResults.push({
          questionNumber: parseInt(questionIndex) + 1,
          solution: question.solution,
          userAnswer: buildAnswer.arrangedWords.join(" "),
          scores: {
            sentenceMastery,
            attempts: buildAnswer.attempts
          }
        });
      }
    }

    return { evaluationResults, hasSentenceBuildAnswers };
  }

  private createEvaluationResult(questionIndex: number, referenceText: string, audioAnswer: AudioAnswer): EvaluationResult {
    return {
      questionNumber: questionIndex + 1,
      referenceText,
      transcript: audioAnswer.scores?.transcript || "",
      scores: {
        pronunciation: audioAnswer.scores?.pronunciation || 0,
        fluency: audioAnswer.scores?.fluency || 0,
        accuracy: 0,
        phonetic: 0
      }
    };
  }

  private createFullEvaluationResult(questionIndex: number, referenceText: string, scores: EvaluationScores): EvaluationResult {
    return {
      questionNumber: questionIndex + 1,
      referenceText,
      transcript: scores.transcript,
      scores: {
        pronunciation: scores.pronunciation,
        fluency: scores.fluency,
        accuracy: scores.accuracy,
        phonetic: scores.phonetic
      }
    };
  }

  logSectionResults(evaluationResults: EvaluationResult[], sectionTitle: string): void {
    console.log(`\n=== ${sectionTitle}: Final Evaluation Results ===`);
    evaluationResults.forEach(result => {
      console.log(`\nQuestion ${result.questionNumber}:`);
      if (result.referenceText) console.log("Reference:", result.referenceText);
      if (result.transcript) console.log("Transcript:", result.transcript);
      if (result.userAnswer) console.log("Your Answer:", result.userAnswer);
      console.log("Scores:", result.scores);
    });

    if (evaluationResults.length > 0) {
      const averageScores = this.calculateAverageScores(evaluationResults);
      console.log(`\n${sectionTitle} Average Scores:`, averageScores);
    }
    console.log("=====================================\n");
  }

  private calculateAverageScores(evaluationResults: EvaluationResult[]) {
    const totalQuestions = evaluationResults.length;
    const firstResult = evaluationResults[0].scores;
    const scoreKeys = Object.keys(firstResult) as Array<keyof typeof firstResult>;

    const totals = scoreKeys.reduce((acc, key) => {
      acc[key] = evaluationResults.reduce((sum, result) => sum + (result.scores[key] || 0), 0);
      return acc;
    }, {} as Record<keyof typeof firstResult, number>);

    return Object.entries(totals).reduce((acc, [key, total]) => {
      acc[key] = Math.round(total / totalQuestions * 10) / 10;
      return acc;
    }, {} as Record<string, number>);
  }
} 