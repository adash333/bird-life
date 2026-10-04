# AGENTS.md

## Git workflow

- Work directly on `main` unless the repository owner explicitly instructs otherwise.
- Keep `main` pushed and up to date at the end of each completed unit of work.
- When the user requests `/save-prompt`, follow `.claude/skills/save-prompt/SKILL.md`.

## Prompt preservation

The user's prompt text saved by `/save-prompt` is an immutable record.

- Preserve every saved user prompt verbatim.
- Never summarize, rewrite, proofread, normalize, translate, or reformat the prompt body.
- Preserve typos, punctuation, capitalization, full-width/half-width characters, spaces, URLs, and line breaks as supplied.
- Never truncate a long prompt or pasted document.
- If exact source text is unavailable, do not reconstruct it from memory; report that it cannot be saved verbatim.

Only the response/result section may be summarized.
