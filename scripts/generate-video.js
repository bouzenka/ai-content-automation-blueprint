/**
 * generate-video.js
 *
 * Skeleton for automating faceless video generation:
 * 1. Send script text to ElevenLabs -> get voiceover audio
 * 2. Send audio (or text) to HeyGen -> generate avatar video
 * 3. Poll HeyGen until the video render is complete
 * 4. Return the final video URL, ready for distribute-content.js
 *
 * Fill in real API keys via environment variables — never hardcode
 * keys or tokens in this file.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '';
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || '';
const HEYGEN_AVATAR_ID = process.env.HEYGEN_AVATAR_ID || '';

async function generateVoiceover(scriptText) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: scriptText,
        model_id: 'eleven_multilingual_v2',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function startHeyGenVideo(scriptText) {
  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': HEYGEN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: HEYGEN_AVATAR_ID,
          },
          voice: {
            type: 'text',
            input_text: scriptText,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`HeyGen error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.video_id;
}

async function pollHeyGenVideo(videoId, intervalMs = 10000, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      { headers: { 'X-Api-Key': HEYGEN_API_KEY } }
    );
    const data = await response.json();

    if (data.data.status === 'completed') {
      return data.data.video_url;
    }
    if (data.data.status === 'failed') {
      throw new Error('HeyGen video generation failed');
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('HeyGen video generation timed out');
}

async function generateVideoFromScript(scriptText) {
  const videoId = await startHeyGenVideo(scriptText);
  const videoUrl = await pollHeyGenVideo(videoId);
  return videoUrl;
}

module.exports = { generateVoiceover, startHeyGenVideo, pollHeyGenVideo, generateVideoFromScript };

// Example usage (chained with distribute-content.js):
// const { generateVideoFromScript } = require('./generate-video');
// const { distributeContent } = require('./distribute-content');
//
// (async () => {
//   const videoUrl = await generateVideoFromScript('نص الفيديو هنا...');
//   await distributeContent({
//     title: 'Cybersecurity Tip #1',
//     description: '...',
//     mediaUrl: videoUrl,
//     platforms: ['facebook', 'instagram', 'youtube'],
//   });
// })();
