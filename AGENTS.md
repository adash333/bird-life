# AGENTS.md

## Git workflow

- Work directly on `main` unless the repository owner explicitly instructs otherwise.
- Keep `main` pushed and up to date at the end of each completed unit of work.
- **At the end of every work session/turn that changes this repository, always run `/save-prompt` automatically, even if the user does not explicitly request it.**
- Follow `.claude/skills/save-prompt/SKILL.md` for the save procedure.

## Requirements document

- `docs/REQUIREMENTS.md` (要件定義書) is the single source of truth for what the game must do.
- **Whenever a change adds, removes, or alters behavior, update `docs/REQUIREMENTS.md` in the same commit**, citing the `docs/prompt/` record number that motivated it, and bump its 最終更新 line.

## Prompt preservation

The user's prompt text saved by `/save-prompt` is an immutable record.

- Preserve every saved user prompt verbatim.
- Never summarize, rewrite, proofread, normalize, translate, or reformat the prompt body.
- Preserve typos, punctuation, capitalization, full-width/half-width characters, spaces, URLs, and line breaks as supplied.
- Never truncate a long prompt or pasted document.
- If exact source text is unavailable, do not reconstruct it from memory; report that it cannot be saved verbatim.

Only the response/result section may be summarized.
