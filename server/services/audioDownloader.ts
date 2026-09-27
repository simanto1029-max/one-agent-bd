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
 * Clean MIME type to standard formats accepted by Google GenAI
 */
export function cleanAudioMimeType(rawMime?: string): string {
  if (!rawMime) return 'audio/wav';
  const clean = rawMime.split(';')[0].trim().toLowerCase();
  if (clean === 'audio/x-m4a' || clean === 'audio/m4a' || clean === 'audio/aac' || clean === 'audio/mp4') return 'audio/wav';
  if (clean === 'audio/x-wav') return 'audio/wav';
  if (clean === 'audio/opus') return 'audio/ogg';
  return clean || 'audio/wav';
}

/**
 * Convert any audio (AAC, MP4, OGG, Opus, WebM, M4A) to 16kHz mono WAV using ffmpeg.
 * Google Gemini multimodal API natively and flawlessly decodes 16kHz WAV speech in Bengali.
 */
export async function convertToWav(inputBuffer: Buffer): Promise<{ buffer: Buffer; base64: string; mimeType: string }> {
  const id = Math.random().toString(36).slice(2, 9);
  const tempInput = path.join(os.tmpdir(), `audio_in_${Date.now()}_${id}.tmp`);
  const tempOutput = path.join(os.tmpdir(), `audio_out_${Date.now()}_${id}.wav`);

  try {
    await fs.promises.writeFile(tempInput, inputBuffer);
    // Convert to 16000Hz mono PCM 16-bit WAV
    await execAsync(`ffmpeg -y -i "${tempInput}" -ar 16000 -ac 1 -c:a pcm_s16le "${tempOutput}"`);
    const wavBuffer = await fs.promises.readFile(tempOutput);
    return {
      buffer: wavBuffer,
      base64: wavBuffer.toString('base64'),
      mimeType: 'audio/wav'
    };
  } catch (err: any) {
    console.warn('[AudioDownloader] ffmpeg conversion failed, returning original:', err?.message || err);
    return {
      buffer: inputBuffer,
      base64: inputBuffer.toString('base64'),
      mimeType: 'audio/wav'
    };
  } finally {
    fs.promises.unlink(tempInput).catch(() => {});
    fs.promises.unlink(tempOutput).catch(() => {});
  }
}

/**
 * Download audio from a direct URL (e.g. Facebook Messenger attachment CDN URL)
 */
export async function downloadMessengerAudio(url: string): Promise<DownloadedAudio | null> {
  try {
    console.log(`[AudioDownloader] Downloading Messenger audio from: ${url.slice(0, 60)}...`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReplayAgentBot/1.0)'
      }
    });

    if (!res.ok) {
      console.error(`[AudioDownloader] Failed to download Messenger audio: ${res.status} ${res.statusText}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);
    console.log(`[AudioDownloader] Raw Messenger audio downloaded: ${rawBuffer.length} bytes. Converting to 16kHz WAV...`);

    const converted = await convertToWav(rawBuffer);
    console.log(`[AudioDownloader] Messenger audio converted to WAV: ${converted.buffer.length} bytes`);

    return {
      buffer: converted.buffer,
      base64: converted.base64,
      mimeType: 'audio/wav',
      sizeBytes: converted.buffer.length
    };
  } catch (err) {
    console.error('[AudioDownloader] Error downloading Messenger audio:', err);
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
    console.log(`[AudioDownloader] Raw WhatsApp audio downloaded: ${rawBuffer.length} bytes. Converting to 16kHz WAV...`);

    const converted = await convertToWav(rawBuffer);
    console.log(`[AudioDownloader] WhatsApp voice converted to WAV: ${converted.buffer.length} bytes`);

    return {
      buffer: converted.buffer,
      base64: converted.base64,
      mimeType: 'audio/wav',
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

