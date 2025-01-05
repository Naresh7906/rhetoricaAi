import * as sdk from "microsoft-cognitiveservices-speech-sdk";

interface EvaluationScores {
  pronunciation: number;
  fluency: number;
  accuracy: number;  // Text matching score
  phonetic: number;  // Phonetic similarity score
  transcript: string;
}

export class SpeechEvaluationService {
  private speechConfig: sdk.SpeechConfig;

  constructor() {
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      throw new Error("Azure Speech Service credentials are not configured");
    }

    this.speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    this.speechConfig.speechRecognitionLanguage = "en-US";
    this.speechConfig.outputFormat = sdk.OutputFormat.Detailed;
  }

  private async blobToWavArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    const audioContext = new AudioContext({
      sampleRate: 16000
    });

    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get the raw PCM data
    const pcmData = audioBuffer.getChannelData(0);
    
    // Resample to 16kHz if needed
    let samples = pcmData;
    if (audioBuffer.sampleRate !== 16000) {
      const resampleRatio = 16000 / audioBuffer.sampleRate;
      const resampledLength = Math.ceil(pcmData.length * resampleRatio);
      const resampledData = new Float32Array(resampledLength);
      
      for (let i = 0; i < resampledLength; i++) {
        const originalIndex = i / resampleRatio;
        const index1 = Math.floor(originalIndex);
        const index2 = Math.min(index1 + 1, pcmData.length - 1);
        const fraction = originalIndex - index1;
        
        resampledData[i] = pcmData[index1] * (1 - fraction) + pcmData[index2] * fraction;
      }
      samples = resampledData;
    }

    // Convert to 16-bit PCM
    const wavData = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      wavData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Create WAV header
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // "RIFF" chunk descriptor
    view.setUint32(0, 0x52494646, false);  // "RIFF"
    view.setUint32(4, 36 + wavData.length * 2, true);  // File size
    view.setUint32(8, 0x57415645, false);  // "WAVE"
    
    // "fmt " sub-chunk
    view.setUint32(12, 0x666D7420, false);  // "fmt "
    view.setUint32(16, 16, true);  // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true);  // NumChannels (1 for mono)
    view.setUint32(24, 16000, true);  // SampleRate (16kHz)
    view.setUint32(28, 16000 * 2, true);  // ByteRate
    view.setUint16(32, 2, true);  // BlockAlign
    view.setUint16(34, 16, true);  // BitsPerSample (16)
    
    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false);  // "data"
    view.setUint32(40, wavData.length * 2, true);  // Subchunk2Size
    
    // Combine header and data
    const finalBuffer = new Uint8Array(wavHeader.byteLength + wavData.buffer.byteLength);
    finalBuffer.set(new Uint8Array(wavHeader), 0);
    finalBuffer.set(new Uint8Array(wavData.buffer), wavHeader.byteLength);

    return finalBuffer.buffer;
  }

  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[.,!?;:'"]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getPhoneticCode(text: string): string {
    const normalized = this.normalizeText(text);
    let code = '';
    const chars = normalized.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      const next = chars[i + 1] || '';
      
      switch (c) {
        case 'a': case 'e': case 'i': case 'o': case 'u':
          if (i === 0) code += 'A';
          break;
        case 'b':
          code += 'B';
          break;
        case 'c':
          if (next === 'h') {
            code += 'CH';
            i++;
          } else if (next === 'i' || next === 'e' || next === 'y') {
            code += 'S';
          } else {
            code += 'K';
          }
          break;
        case 'd':
          code += 'D';
          break;
        case 'f':
          code += 'F';
          break;
        case 'g':
          code += 'G';
          break;
        case 'h':
          code += 'H';
          break;
        case 'j':
          code += 'J';
          break;
        case 'k':
          code += 'K';
          break;
        case 'l':
          code += 'L';
          break;
        case 'm':
          code += 'M';
          break;
        case 'n':
          code += 'N';
          break;
        case 'p':
          code += 'P';
          break;
        case 'q':
          code += 'K';
          break;
        case 'r':
          code += 'R';
          break;
        case 's':
          if (next === 'h') {
            code += 'SH';
            i++;
          } else {
            code += 'S';
          }
          break;
        case 't':
          if (next === 'h') {
            code += 'TH';
            i++;
          } else {
            code += 'T';
          }
          break;
        case 'v':
          code += 'V';
          break;
        case 'w':
          code += 'W';
          break;
        case 'x':
          code += 'KS';
          break;
        case 'y':
          code += 'Y';
          break;
        case 'z':
          code += 'Z';
          break;
      }
    }
    return code;
  }

  private calculateTextSimilarity(str1: string, str2: string): number {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);

    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;

    const matrix: number[][] = [];
    for (let i = 0; i <= s1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLength = Math.max(s1.length, s2.length);
    const distance = matrix[s1.length][s2.length];
    return Math.round((1 - distance / maxLength) * 100);
  }

  private calculatePhoneticSimilarity(str1: string, str2: string): number {
    const code1 = this.getPhoneticCode(str1);
    const code2 = this.getPhoneticCode(str2);
    return this.calculateTextSimilarity(code1, code2);
  }

  public async evaluateReading(audioBlob: Blob, referenceText: string): Promise<EvaluationScores> {
    const audioBuffer = await this.blobToWavArrayBuffer(audioBlob);
    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(new Uint8Array(audioBuffer));
    pushStream.close();
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    );

    const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);
    pronunciationAssessmentConfig.applyTo(recognizer);

    return new Promise((resolve, reject) => {
      let pronunciationScore = 0;
      let fluencyScore = 0;
      let transcript = "";

      recognizer.recognized = (_, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(e.result);
          pronunciationScore = pronunciationResult.pronunciationScore;
          fluencyScore = pronunciationResult.fluencyScore;
          transcript = e.result.text;
        }
      };

      recognizer.canceled = (_, e) => {
        reject(new Error(`Recognition canceled: ${e.errorDetails || e.reason}`));
      };

      recognizer.recognizeOnceAsync(
        () => {
          recognizer.close();
          const accuracy = this.calculateTextSimilarity(transcript, referenceText);
          const phoneticScore = this.calculatePhoneticSimilarity(transcript, referenceText);

          resolve({
            pronunciation: pronunciationScore,
            fluency: fluencyScore,
            accuracy,
            phonetic: phoneticScore,
            transcript
          });
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }

  public async evaluateOpenEndedSpeech(audioBlob: Blob): Promise<EvaluationScores> {
    const audioBuffer = await this.blobToWavArrayBuffer(audioBlob);
    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(new Uint8Array(audioBuffer));
    pushStream.close();
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    
    const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      let transcript = "";

      recognizer.recognized = (_, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          transcript = e.result.text;
        }
      };

      recognizer.canceled = (_, e) => {
        reject(new Error(`Recognition canceled: ${e.errorDetails || e.reason}`));
      };

      recognizer.recognizeOnceAsync(
        () => {
          recognizer.close();
          
          // For open-ended answers, we only evaluate fluency based on speech recognition
          // and set a default score for pronunciation since there's no reference text
          resolve({
            pronunciation: 100, // Default score since we can't compare pronunciation
            fluency: 100, // Default score since we can't compare fluency
            accuracy: 100, // Not applicable for open-ended
            phonetic: 100, // Not applicable for open-ended
            transcript
          });
        },
        error => {
          recognizer.close();
          reject(error);
        }
      );
    });
  }
} 