/**
 * distribute-content.js
 *
 * Skeleton for routing generated content (faceless videos, posts) to
 * Facebook, Instagram, and YouTube via Zapier webhooks.
 *
 * Fill in ZAPIER_WEBHOOK_URLS from environment variables — never hardcode
 * real webhook URLs or tokens in this file.
 */

const WEBHOOKS = {
  facebook: process.env.ZAPIER_WEBHOOK_FACEBOOK || '',
  instagram: process.env.ZAPIER_WEBHOOK_INSTAGRAM || '',
  youtube: process.env.ZAPIER_WEBHOOK_YOUTUBE || '',
};

/**
 * @param {Object} content
 * @param {string} content.title
 * @param {string} content.description
 * @param {string} content.mediaUrl - URL of the generated video/image asset
 * @param {string[]} content.platforms - e.g. ['facebook', 'instagram', 'youtube']
 */
async function distributeContent(content) {
  const results = {};

  for (const platform of content.platforms) {
    const webhookUrl = WEBHOOKS[platform];
    if (!webhookUrl) {
      results[platform] = { skipped: true, reason: 'No webhook URL configured' };
      continue;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: content.title,
          description: content.description,
          mediaUrl: content.mediaUrl,
        }),
      });
      results[platform] = { success: response.ok, status: response.status };
    } catch (err) {
      results[platform] = { success: false, error: err.message };
    }
  }

  return results;
}

module.exports = { distributeContent };

// Example usage:
// distributeContent({
//   title: 'Cybersecurity Tip #1',
//   description: 'Quick tip on password hygiene',
//   mediaUrl: 'https://example.com/video.mp4',
//   platforms: ['facebook', 'instagram', 'youtube'],
// });
