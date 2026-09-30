// Utility to record audio from microphone and encode directly to universal MP3 (audio/mpeg) or WAV (audio/wav)
// so that outbound voice messages play with 100% loud, clear sound on Facebook Messenger, Instagram, WhatsApp, and Web!

import { Mp3Encoder } from '@breezystack/lamejs';

export interface RecordedAudio {
  base64: string;
  mimeType: string;
  blob: Blob;
  durationSeconds: number;
}

/**
 * Normalize Float32 PCM samples so quiet microphone recordings are boosted to clear, audible volume.
 */
function normalizePcmSamples(samples: Float32Array): Int16Array {
  let maxPeak = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxPeak) maxPeak = abs;
  }

  // Boost quiet mic input up to 0.88 peak (max 8x boost to avoid amplifying pure silence)
  const gain = maxPeak > 0.002 && maxPeak < 0.85 ? Math.min(0.88 / maxPeak, 8.0) : 1.0;

  const int16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    let s = samples[i] * gain;
    if (s > 1) s = 1;
    else if (s < -1) s = -1;
    int16[i] = s < 0 ? Math.round(s * 32768) : Math.round(s * 32767);
  }
  return int16;
}

/**
 * Encode Int16 mono PCM samples into a standard MP3 Blob (audio/mpeg) using LAME encoder.
 */
function encodePcmToMp3Blob(pcm16: Int16Array, sampleRate: number): Blob {
  const mp3Encoder = new Mp3Encoder(1, sampleRate, 64); // 1 channel (mono), sampleRate, 64 kbps
  const blockSize = 1152;
  const mp3Chunks: Uint8Array[] = [];

  for (let i = 0; i < pcm16.length; i += blockSize) {
    const chunk = pcm16.subarray(i, i + blockSize);
    const mp3buf = mp3Encoder.encodeBuffer(chunk);
    if (mp3buf && mp3buf.length > 0) {
      mp3Chunks.push(new Uint8Array(mp3buf));
    }
  }

  const endBuf = mp3Encoder.flush();
  if (endBuf && endBuf.length > 0) {
    mp3Chunks.push(new Uint8Array(endBuf));
  }

  return new Blob(mp3Chunks, { type: 'audio/mpeg' });
}

/**
 * Fallback: Encode Int16 mono PCM samples into a standard 16-bit WAV Blob (audio/wav).
 */
function encodePcmToWavBlob(pcm16: Int16Array, sampleRate: number): Blob {
  const dataByteLength = pcm16.length * 2;
  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < pcm16.length; i++, offset += 2) {
    view.setInt16(offset, pcm16[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export class BrowserAudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private pcmChunks: Float32Array[] = [];
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sampleRate: number = 44100;
  private startTime: number = 0;
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported in this browser.');
    }

    this.audioChunks = [];
    this.pcmChunks = [];

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // 1. Start Web Audio API live PCM capture so we get raw lossless audio samples
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        if (this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume().catch(() => {});
        }
        this.sampleRate = this.audioCtx.sampleRate || 44100;
        this.sourceNode = this.audioCtx.createMediaStreamSource(this.stream);
        this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

        this.processorNode.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          if (inputData && inputData.length > 0) {
            this.pcmChunks.push(new Float32Array(inputData));
          }
        };

        this.sourceNode.connect(this.processorNode);
        this.processorNode.connect(this.audioCtx.destination);
      }
    } catch (ctxErr) {
      console.warn('[AudioRecorder] Web Audio live capture warning:', ctxErr);
    }

    // 2. Also run MediaRecorder in parallel as backup / secondary decoder source
    let mimeType = '';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      }

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
    }

    this.startTime = Date.now();
  }

  private cleanupAudioGraph(): void {
    try {
      if (this.processorNode) {
        this.processorNode.onaudioprocess = null;
        this.processorNode.disconnect();
        this.processorNode = null;
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.close().catch(() => {});
        this.audioCtx = null;
      }
    } catch {}
  }

  async stop(): Promise<RecordedAudio> {
    // Wait 120ms before stopping so the final spoken syllable is never clipped
    await new Promise((r) => setTimeout(r, 120));

    return new Promise((resolve, reject) => {
      const finalizeRecording = async () => {
        try {
          const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
          const rawMimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const rawBlob = new Blob(this.audioChunks, { type: rawMimeType });

          // Combine live ScriptProcessor PCM chunks
          const totalLiveSamples = this.pcmChunks.reduce((acc, c) => acc + c.length, 0);
          let finalSamples: Float32Array | null = null;
          let finalSampleRate = this.sampleRate || 44100;

          if (totalLiveSamples > 0) {
            finalSamples = new Float32Array(totalLiveSamples);
            let offset = 0;
            for (const chunk of this.pcmChunks) {
              finalSamples.set(chunk, offset);
              offset += chunk.length;
            }
          }

          // Check if live samples have audible signal; if not (or to compare), try decoding MediaRecorder blob
          let livePeak = 0;
          if (finalSamples) {
            for (let i = 0; i < finalSamples.length; i += 4) {
              const a = Math.abs(finalSamples[i]);
              if (a > livePeak) livePeak = a;
            }
          }

          if (rawBlob.size > 200 && (!finalSamples || livePeak < 0.005)) {
            try {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              const decodeCtx = new AudioContextClass();
              const arrBuf = await rawBlob.arrayBuffer();
              const decoded = await decodeCtx.decodeAudioData(arrBuf);
              if (decoded && decoded.length > 0) {
                const ch0 = decoded.getChannelData(0);
                let decodedPeak = 0;
                for (let i = 0; i < ch0.length; i += 4) {
                  const a = Math.abs(ch0[i]);
                  if (a > decodedPeak) decodedPeak = a;
                }
                if (decodedPeak >= livePeak || !finalSamples) {
                  finalSamples = new Float32Array(ch0);
                  finalSampleRate = decoded.sampleRate || 44100;
                }
              }
              decodeCtx.close().catch(() => {});
            } catch (decErr) {
              console.warn('[AudioRecorder] decodeAudioData fallback notice:', decErr);
            }
          }

          // Clean up mic stream and audio graph
          this.cleanupAudioGraph();
          if (this.stream) {
            this.stream.getTracks().forEach((t) => t.stop());
            this.stream = null;
          }

          // Encode normalized PCM samples into universal MP3 (audio/mpeg), with WAV fallback
          if (finalSamples && finalSamples.length > 100) {
            const pcm16 = normalizePcmSamples(finalSamples);
            let encodedBlob: Blob;
            let encodedMime = 'audio/mpeg';

            try {
              encodedBlob = encodePcmToMp3Blob(pcm16, finalSampleRate);
              if (encodedBlob.size < 256) {
                throw new Error('MP3 output too small, using WAV');
              }
            } catch (mp3Err) {
              console.warn('[AudioRecorder] MP3 encode fallback to WAV:', mp3Err);
              encodedBlob = encodePcmToWavBlob(pcm16, finalSampleRate);
              encodedMime = 'audio/wav';
            }

            const base64 = await blobToBase64(encodedBlob);
            return resolve({
              base64,
              mimeType: encodedMime,
              blob: encodedBlob,
              durationSeconds
            });
          }

          // Ultimate fallback if neither PCM nor decodeAudioData was available
          const base64 = await blobToBase64(rawBlob);
          resolve({
            base64,
            mimeType: rawMimeType.split(';')[0],
            blob: rawBlob,
            durationSeconds
          });
        } catch (err) {
          reject(err);
        }
      };

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          finalizeRecording();
        };
        try {
          this.mediaRecorder.requestData();
        } catch {}
        this.mediaRecorder.stop();
      } else {
        finalizeRecording();
      }
    });
  }

  cancel(): void {
    this.cleanupAudioGraph();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.audioChunks = [];
    this.pcmChunks = [];
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
