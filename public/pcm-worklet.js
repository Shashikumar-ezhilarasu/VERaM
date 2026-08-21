class PCMWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // 4096 samples at 16kHz is ~256ms. Let's use 2048 for ~128ms chunks.
    this.bufferSize = 2048; 
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bytesWritten++] = channelData[i];
        
        if (this.bytesWritten >= this.bufferSize) {
          this.flush();
        }
      }
    }
    return true;
  }

  flush() {
    const int16Buffer = new Int16Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      let s = Math.max(-1, Math.min(1, this.buffer[i]));
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    this.port.postMessage(int16Buffer.buffer, [int16Buffer.buffer]);
    this.bytesWritten = 0;
  }
}

registerProcessor('pcm-worklet', PCMWorkletProcessor);
