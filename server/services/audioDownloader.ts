/**
 * Service to download audio / voice notes from WhatsApp Cloud API and Facebook Messenger
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export interface DownloadedAudio {
  buffer: Buffer;
  base64: string;
  mimeType: string;
  sizeBytes: number;
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

  // If on Vercel Serverless, skip spawning ffmpeg (not installed) and use native Gemini audio MIME support
  if (process.env.VERCEL) {
    return {
      buffer: inputBuffer,
      base64: inputBuffer.toString('base64'),
      mimeType: detectedOriginalMime
    };
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
    return {
      buffer: inputBuffer,
      base64: inputBuffer.toString('base64'),
      mimeType: detectedOriginalMime
    };
  } catch (err: any) {
    console.warn(`[AudioDownloader] ffmpeg not available, using native ${detectedOriginalMime} format`);
    return {
      buffer: inputBuffer,
      base64: inputBuffer.toString('base64'),
      mimeType: detectedOriginalMime
    };
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

