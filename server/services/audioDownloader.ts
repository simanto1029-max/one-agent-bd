/**
 * Service to download audio / voice notes from WhatsApp Cloud API and Facebook Messenger
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Mp3Encoder } from '@breezystack/lamejs';

const execAsync = promisify(exec);

/**
 * Convert a 16-bit PCM WAV Buffer to MP3 (audio/mpeg) in pure TypeScript using @breezystack/lamejs.
 * Works on Vercel Serverless without requiring ffmpeg.
 */
export function wavBufferToMp3(wavBuf: Buffer): Buffer | null {
  try {
    if (wavBuf.length < 44 || wavBuf.subarray(0, 4).toString('latin1') !== 'RIFF') {
      return null;
    }
    const numChannels = wavBuf.readUInt16LE(22) || 1;
    const sampleRate = wavBuf.readUInt32LE(24) || 44100;
    const bitsPerSample = wavBuf.readUInt16LE(34) || 16;
    if (bitsPerSample !== 16) return null;

    // Locate 'data' chunk
    let dataOffset = 12;
    let dataLength = wavBuf.length - 44;
    while (dataOffset + 8 <= wavBuf.length) {
      const chunkId = wavBuf.subarray(dataOffset, dataOffset + 4).toString('latin1');
      const chunkSize = wavBuf.readUInt32LE(dataOffset + 4);
      if (chunkId === 'data') {
        dataOffset += 8;
        dataLength = Math.min(chunkSize, wavBuf.length - dataOffset);
        break;
      }
      dataOffset += 8 + chunkSize;
    }
    if (dataOffset >= wavBuf.length || dataLength <= 0) {
      dataOffset = 44;
      dataLength = wavBuf.length - 44;
    }

    const totalSamples = Math.floor(dataLength / (2 * numChannels));
    if (totalSamples <= 0) return null;

    const monoPcm = new Int16Array(totalSamples);
    let maxPeak = 0;
    for (let i = 0; i < totalSamples; i++) {
      const sample = wavBuf.readInt16LE(dataOffset + i * 2 * numChannels);
      monoPcm[i] = sample;
      const abs = Math.abs(sample);
      if (abs > maxPeak) maxPeak = abs;
    }

    // Normalize volume if quiet
    if (maxPeak > 60 && maxPeak < 26000) {
      const gain = Math.min(28500 / maxPeak, 8.0);
      for (let i = 0; i < totalSamples; i++) {
        const boosted = Math.round(monoPcm[i] * gain);
        monoPcm[i] = Math.max(-32768, Math.min(32767, boosted));
      }
    }

    const encoder = new Mp3Encoder(1, sampleRate, 64);
    const blockSize = 1152;
    const outChunks: Buffer[] = [];
    for (let i = 0; i < monoPcm.length; i += blockSize) {
      const slice = monoPcm.subarray(i, i + blockSize);
      const mp3Buf = encoder.encodeBuffer(slice);
      if (mp3Buf && mp3Buf.length > 0) {
        outChunks.push(Buffer.from(mp3Buf));
      }
    }
    const endBuf = encoder.flush();
    if (endBuf && endBuf.length > 0) {
      outChunks.push(Buffer.from(endBuf));
    }

    return outChunks.length > 0 ? Buffer.concat(outChunks) : null;
  } catch (err) {
    console.warn('[AudioDownloader] wavBufferToMp3 warning:', err);
    return null;
  }
}

/**
 * Prepare outbound voice buffer for Meta Graph API (Messenger, Instagram, WhatsApp)
 * so that the recipient always hears clear, uncorrupted audio on Android, iOS, and Web.
 */
export async function prepareOutboundVoiceForMeta(
  inputBuffer: Buffer,
  declaredMime?: string,
  platform: 'whatsapp' | 'messenger' | 'instagram' = 'messenger'
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  const detected = detectAudioMimeTypeFromBuffer(inputBuffer, declaredMime);

  // 1. If already a valid MP3 (from our upgraded BrowserAudioRecorder), return ready-to-play MP3
  if (detected === 'audio/mp3' || detected === 'audio/mpeg') {
    return {
      buffer: inputBuffer,
      mimeType: 'audio/mpeg',
      ext: 'mp3'
    };
  }

  // 2. If input is 16-bit PCM WAV, encode to MP3 in pure TS so WhatsApp, Messenger, and Instagram all play it natively
  if (detected === 'audio/wav') {
    const mp3Buf = wavBufferToMp3(inputBuffer);
    if (mp3Buf && mp3Buf.length > 200) {
      return {
        buffer: mp3Buf,
        mimeType: 'audio/mpeg',
        ext: 'mp3'
      };
    }
    if (platform !== 'whatsapp') {
      return {
        buffer: inputBuffer,
        mimeType: 'audio/wav',
        ext: 'wav'
      };
    }
  }

  // 3. If input is WebM/OGG/MP4 and ffmpeg is available on the server, transcode + normalize to MP3
  if (!process.env.VERCEL) {
    const id = Math.random().toString(36).slice(2, 9);
    const tempIn = path.join(os.tmpdir(), `voice_out_in_${Date.now()}_${id}.tmp`);
    const tempOut = path.join(os.tmpdir(), `voice_out_mp3_${Date.now()}_${id}.mp3`);
    try {
      await fs.promises.writeFile(tempIn, inputBuffer);
      await execAsync(
        `ffmpeg -y -i "${tempIn}" -vn -af "volume=1.6" -ar 44100 -ac 1 -c:a libmp3lame -b:a 64k "${tempOut}"`
      );
      const mp3Buffer = await fs.promises.readFile(tempOut);
      if (mp3Buffer && mp3Buffer.length > 200) {
        return {
          buffer: mp3Buffer,
          mimeType: 'audio/mpeg',
          ext: 'mp3'
        };
      }
    } catch {
      // Fallback if libmp3lame not available: convert to WAV then encode with Mp3Encoder
      try {
        const wavRes = await convertToWav(inputBuffer, detected);
        if (wavRes.mimeType === 'audio/wav') {
          const mp3FromWav = wavBufferToMp3(wavRes.buffer);
          if (mp3FromWav && mp3FromWav.length > 200) {
            return {
              buffer: mp3FromWav,
              mimeType: 'audio/mpeg',
              ext: 'mp3'
            };
          }
        }
      } catch {}
    } finally {
      fs.promises.unlink(tempIn).catch(() => {});
      fs.promises.unlink(tempOut).catch(() => {});
    }
  }

  // 4. Final fallback
  if (detected === 'audio/ogg') {
    return { buffer: inputBuffer, mimeType: 'audio/ogg', ext: 'ogg' };
  }
  if (detected === 'audio/mp4' || detected === 'audio/aac') {
    return { buffer: inputBuffer, mimeType: 'audio/mp4', ext: 'm4a' };
  }
  return {
    buffer: inputBuffer,
    mimeType: 'audio/mpeg',
    ext: 'mp3'
  };
}

export interface DownloadedAudio {
  buffer: Buffer;
  base64: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Pure-TypeScript MP4/M4A (ftypmp42 / isom) to ADTS AAC converter for Vercel Serverless
 * where ffmpeg is not installed. Extracts AAC frames using stsz box and prepends 7-byte ADTS headers.
 */
export function mp4ToAdtsAac(buf: Buffer): Buffer | null {
  try {
    const stszIdx = buf.indexOf(Buffer.from('stsz', 'latin1'));
    const stcoIdx = buf.indexOf(Buffer.from('stco', 'latin1'));
    if (stszIdx === -1 || stcoIdx === -1) return null;

    const sampleSize = buf.readUInt32BE(stszIdx + 8);
    const sampleCount = buf.readUInt32BE(stszIdx + 12);
    if (sampleCount === 0 || sampleCount > 50000) return null;

    const sizes: number[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const sz = sampleSize !== 0 ? sampleSize : buf.readUInt32BE(stszIdx + 16 + i * 4);
      if (sz <= 0 || sz > buf.length) return null;
      sizes.push(sz);
    }

    const firstChunkOffset = buf.readUInt32BE(stcoIdx + 12);
    if (firstChunkOffset >= buf.length) return null;

    // Parse AudioSpecificConfig (0x05 tag inside esds) if present, otherwise default to 44.1kHz mono AAC-LC
    let profile = 1; // AAC-LC (objectType 2 -> profile = objectType - 1 = 1)
    let freqIdx = 4; // 44100 Hz
    let chanCfg = 1; // 1 channel (mono)

    const esdsIdx = buf.indexOf(Buffer.from('esds', 'latin1'));
    if (esdsIdx !== -1) {
      for (let i = esdsIdx + 8; i < Math.min(buf.length - 4, esdsIdx + 64); i++) {
        if (buf[i] === 0x05) {
          let lenPos = i + 1;
          while (lenPos < buf.length && (buf[lenPos] & 0x80) !== 0) lenPos++;
          const ascPos = lenPos + 1;
          if (ascPos + 1 < buf.length) {
            const b0 = buf[ascPos];
            const b1 = buf[ascPos + 1];
            const audioObjectType = (b0 >> 3) & 0x1f;
            const samplingFreqIndex = ((b0 & 0x07) << 1) | ((b1 >> 7) & 0x01);
            const channelConfiguration = (b1 >> 3) & 0x0f;
            if (audioObjectType >= 1 && audioObjectType <= 4 && samplingFreqIndex <= 12 && channelConfiguration >= 1 && channelConfiguration <= 2) {
              profile = audioObjectType - 1;
              freqIdx = samplingFreqIndex;
              chanCfg = channelConfiguration;
              break;
            }
          }
        }
      }
    }

    const outChunks: Buffer[] = [];
    let offset = firstChunkOffset;
    for (let i = 0; i < sampleCount; i++) {
      const frameLen = sizes[i];
      if (offset + frameLen > buf.length) break;
      const adtsLen = frameLen + 7;
      const header = Buffer.alloc(7);
      header[0] = 0xff;
      header[1] = 0xf1; // MPEG-4, Layer 0, no CRC
      header[2] = ((profile & 0x03) << 6) | ((freqIdx & 0x0f) << 2) | ((chanCfg >> 2) & 0x01);
      header[3] = ((chanCfg & 0x03) << 6) | ((adtsLen >> 11) & 0x03);
      header[4] = (adtsLen >> 3) & 0xff;
      header[5] = ((adtsLen & 0x07) << 5) | 0x1f;
      header[6] = 0xfc;
      outChunks.push(header, buf.subarray(offset, offset + frameLen));
      offset += frameLen;
    }

    if (outChunks.length === 0) return null;
    return Buffer.concat(outChunks);
  } catch {
    return null;
  }
}

/**
 * Detect actual audio MIME type by inspecting magic bytes of the binary buffer.
 * Crucial for Vercel Serverless where ffmpeg is not installed: Gemini natively
 * decodes audio/mp4, audio/ogg, audio/mp3, audio/aac, audio/webm, and audio/wav
 * as long as the declared mimeType matches the actual binary container!
 */
export function detectAudioMimeTypeFromBuffer(buf: Buffer, fallbackMime?: string): string {
  if (buf && buf.length >= 12) {
    const header4 = buf.subarray(0, 4).toString('latin1');
    const bytes4to8 = buf.subarray(4, 8).toString('latin1');

    // 1. WAV: "RIFF" .... "WAVE"
    if (header4 === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WAVE') {
      return 'audio/wav';
    }
    // 2. OGG / Opus (WhatsApp & Messenger voice notes): "OggS"
    if (header4 === 'OggS') {
      return 'audio/ogg';
    }
    // 3. MP4 / M4A / AAC container (Facebook Messenger & iOS voice notes): "....ftyp"
    if (bytes4to8 === 'ftyp' || buf.subarray(0, 32).toString('latin1').includes('ftyp')) {
      return 'audio/mp4';
    }
    // 4. FLAC: "fLaC"
    if (header4 === 'fLaC') {
      return 'audio/flac';
    }
    // 5. WebM / Matroska: 0x1A 0x45 0xDF 0xA3
    if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
      return 'audio/webm';
    }
    // 6. MP3: "ID3" or MPEG sync word (0xFF 0xFB / 0xFF 0xF3 / 0xFF 0xF2 / 0xFF 0xE3)
    if (
      buf.subarray(0, 3).toString('latin1') === 'ID3' ||
      (buf[0] === 0xff && (buf[1] === 0xfb || buf[1] === 0xf3 || buf[1] === 0xf2 || (buf[1] & 0xe0) === 0xe0))
    ) {
      // Check ADTS AAC (0xFF 0xF1 or 0xFF 0xF9) vs MP3
      if (buf[0] === 0xff && (buf[1] & 0xf6) === 0xf0) {
        return 'audio/aac';
      }
      return 'audio/mp3';
    }
  }

  return cleanAudioMimeType(fallbackMime);
}

/**
 * Clean MIME type to standard formats accepted by Google GenAI
 */
export function cleanAudioMimeType(rawMime?: string): string {
  if (!rawMime) return 'audio/mp4';
  const clean = rawMime.split(';')[0].trim().toLowerCase();
  if (clean === 'audio/x-m4a' || clean === 'audio/m4a' || clean === 'audio/mp4' || clean === 'video/mp4') {
    return 'audio/mp4';
  }
  if (clean === 'audio/aac') return 'audio/aac';
  if (clean === 'audio/x-wav' || clean === 'audio/wave') return 'audio/wav';
  if (clean === 'audio/opus' || clean === 'audio/ogg' || clean === 'application/ogg') return 'audio/ogg';
  if (clean === 'audio/mpeg' || clean === 'audio/mp3') return 'audio/mp3';
  if (clean === 'audio/webm' || clean === 'video/webm') return 'audio/webm';
  return clean || 'audio/mp4';
}

/**
 * Convert audio to 16kHz mono WAV using ffmpeg if installed locally.
 * On Vercel Serverless (where ffmpeg is not present), returns the original binary buffer
 * with its TRUE detected MIME type so Gemini Multimodal decodes it natively without error.
 */
export async function convertToWav(
  inputBuffer: Buffer,
  originalMime?: string
): Promise<{ buffer: Buffer; base64: string; mimeType: string }> {
  const detectedOriginalMime = detectAudioMimeTypeFromBuffer(inputBuffer, originalMime);

  const fallbackWithoutFfmpeg = () => {
    if (detectedOriginalMime === 'audio/mp4') {
      const adtsBuffer = mp4ToAdtsAac(inputBuffer);
      if (adtsBuffer && adtsBuffer.length > 16) {
        return {
          buffer: adtsBuffer,
          base64: adtsBuffer.toString('base64'),
          mimeType: 'audio/aac'
        };
      }
    }
    return {
      buffer: inputBuffer,
      base64: inputBuffer.toString('base64'),
      mimeType: detectedOriginalMime
    };
  };

  // If on Vercel Serverless, skip spawning ffmpeg (not installed) and use pure-TS ADTS AAC or native Gemini audio MIME
  if (process.env.VERCEL) {
    return fallbackWithoutFfmpeg();
  }

  const id = Math.random().toString(36).slice(2, 9);
  const tempInput = path.join(os.tmpdir(), `audio_in_${Date.now()}_${id}.tmp`);
  const tempOutput = path.join(os.tmpdir(), `audio_out_${Date.now()}_${id}.wav`);

  try {
    await fs.promises.writeFile(tempInput, inputBuffer);
    // Convert to 16000Hz mono PCM 16-bit WAV
    await execAsync(`ffmpeg -y -i "${tempInput}" -ar 16000 -ac 1 -c:a pcm_s16le "${tempOutput}"`);
    const wavBuffer = await fs.promises.readFile(tempOutput);
    if (wavBuffer.length > 44 && wavBuffer.subarray(0, 4).toString('latin1') === 'RIFF') {
      return {
        buffer: wavBuffer,
        base64: wavBuffer.toString('base64'),
        mimeType: 'audio/wav'
      };
    }
    return fallbackWithoutFfmpeg();
  } catch (err: any) {
    console.warn(`[AudioDownloader] ffmpeg not available, using fallback for ${detectedOriginalMime}`);
    return fallbackWithoutFfmpeg();
  } finally {
    fs.promises.unlink(tempInput).catch(() => {});
    fs.promises.unlink(tempOutput).catch(() => {});
  }
}

/**
 * Download audio from a direct URL (e.g. Facebook Messenger / Instagram attachment CDN URL)
 */
export async function downloadMessengerAudio(url: string): Promise<DownloadedAudio | null> {
  try {
    console.log(`[AudioDownloader] Downloading Messenger audio from: ${url.slice(0, 60)}...`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OneAgentBDBot/1.0)'
      }
    });

    if (!res.ok) {
      console.error(`[AudioDownloader] Failed to download Messenger audio: ${res.status} ${res.statusText}`);
      return null;
    }

    const contentType = res.headers.get('content-type') || undefined;
    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    console.log(`[AudioDownloader] Raw Messenger audio downloaded: ${rawBuffer.length} bytes (Content-Type: ${contentType || 'auto'})`);

    const converted = await convertToWav(rawBuffer, contentType);
    console.log(`[AudioDownloader] Messenger audio ready: ${converted.buffer.length} bytes (${converted.mimeType})`);

    return {
      buffer: converted.buffer,
      base64: converted.base64,
      mimeType: converted.mimeType,
      sizeBytes: converted.buffer.length
    };
  } catch (err) {
    console.error('[AudioDownloader] Error downloading Messenger audio:', err);
    return null;
  }
}

/**
 * Download image from a direct URL (e.g. Facebook Messenger / Instagram image CDN URL)
 */
export async function downloadMessengerImage(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OneAgentBDBot/1.0)'
      }
    });
    if (!res.ok) return null;
    const contentType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    return {
      base64: rawBuffer.toString('base64'),
      mimeType: contentType.startsWith('image/') ? contentType : 'image/jpeg'
    };
  } catch (err) {
    console.error('[ImageDownloader] Error downloading Messenger image:', err);
    return null;
  }
}

/**
 * Download audio from WhatsApp Cloud API using Media ID and Access Token
 */
export async function downloadWhatsAppAudio(mediaId: string, accessToken: string): Promise<DownloadedAudio | null> {
  try {
    console.log(`[AudioDownloader] Fetching WhatsApp media metadata for ID: ${mediaId}`);
    
    // 1. Get media URL from Meta Graph API
    const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!metaRes.ok) {
      const errText = await metaRes.text().catch(() => '');
      console.error(`[AudioDownloader] Meta media lookup failed: ${metaRes.status}`, errText);
      return null;
    }

    const mediaData = (await metaRes.json()) as { url?: string; mime_type?: string };
    if (!mediaData.url) {
      console.error('[AudioDownloader] No media download URL returned by Meta');
      return null;
    }

    // 2. Download binary stream using Bearer token
    console.log(`[AudioDownloader] Downloading binary audio from WhatsApp media URL...`);
    const binaryRes = await fetch(mediaData.url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!binaryRes.ok) {
      console.error(`[AudioDownloader] WhatsApp binary download failed: ${binaryRes.status}`);
      return null;
    }

    const arrayBuffer = await binaryRes.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    console.log(`[AudioDownloader] Raw WhatsApp audio downloaded: ${rawBuffer.length} bytes (${mediaData.mime_type || 'audio/ogg'})`);

    const converted = await convertToWav(rawBuffer, mediaData.mime_type || 'audio/ogg');
    console.log(`[AudioDownloader] WhatsApp voice ready: ${converted.buffer.length} bytes (${converted.mimeType})`);

    return {
      buffer: converted.buffer,
      base64: converted.base64,
      mimeType: converted.mimeType,
      sizeBytes: converted.buffer.length
    };
  } catch (err) {
    console.error('[AudioDownloader] Error downloading WhatsApp audio:', err);
    return null;
  }
}

/**
 * Download customer photo/image from WhatsApp Cloud API using Media ID and Access Token
 */
export async function downloadWhatsAppImage(mediaId: string, accessToken: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    console.log(`[ImageDownloader] Fetching WhatsApp image metadata for ID: ${mediaId}`);
    const metaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!metaRes.ok) {
      console.error(`[ImageDownloader] Meta image lookup failed: ${metaRes.status}`);
      return null;
    }

    const mediaData = (await metaRes.json()) as { url?: string; mime_type?: string };
    if (!mediaData.url) return null;

    const binaryRes = await fetch(mediaData.url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!binaryRes.ok) return null;

    const arrayBuffer = await binaryRes.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    console.log(`[ImageDownloader] WhatsApp image successfully downloaded: ${rawBuffer.length} bytes`);

    return {
      base64: rawBuffer.toString('base64'),
      mimeType: mediaData.mime_type || 'image/jpeg'
    };
  } catch (err) {
    console.error('[ImageDownloader] Error downloading WhatsApp image:', err);
    return null;
  }
}

