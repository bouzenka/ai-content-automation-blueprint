# AI Content Automation Blueprint

Faceless video content pipeline and social publishing automation.

## Stack
- Anthropic API
- MCP (Zapier)
- HeyGen / ElevenLabs
- n8n (workflow automation)

## Structure
- `/workflows` — n8n workflow exports (crypto alerts, content pipelines, etc.)
- `/scripts` — automation scripts (video generation, publishing, distribution)
- `/docs` — planning docs, content calendars, strategy notes
- `/config` — non-secret configuration templates (never commit real API keys)

## Notes
This repo is private. Do not commit API keys, tokens, or credentials — use environment variables or a secrets manager instead.
