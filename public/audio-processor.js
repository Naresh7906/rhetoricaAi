class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isRecording = false;
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;

    this.port.onmessage = (event) => {
      if (event.data.command === 'START_RECORDING') {
        this.isRecording = true;
      } else if (event.data.command === 'STOP_RECORDING') {
        this.isRecording = false;
        if (this.bufferIndex > 0) {
          const finalBuffer = this.buffer.slice(0, this.bufferIndex);
          this.port.postMessage({
            eventType: 'audio',
            audioData: finalBuffer
          });
        }
        this.bufferIndex = 0;
      }
    };
  }

  process(inputs, outputs, parameters) {
    if (!this.isRecording) return true;

    const input = inputs[0];
    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferIndex++] = inputChannel[i];

      if (this.bufferIndex >= this.bufferSize) {
        this.port.postMessage({
          eventType: 'audio',
          audioData: this.buffer
        });
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor('audio-recorder-processor', AudioRecorderProcessor); 