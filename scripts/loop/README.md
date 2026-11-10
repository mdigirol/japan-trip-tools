# Fix loop: setup

Private app only (never in `japan-trip-tools-public`). Rules Claude follows: [`docs/fix-loop.md`](../../docs/fix-loop.md).
Same pattern as the itinerary's comment loop in `japan-trip-2026`.

| Piece | What it is |
|---|---|
| Report a problem (`src/routes/Notes.tsx`, `src/lib/notes.ts`) | The phones file notes as issues labeled `note` in `mdigirol/japan-trip-tools-data`, with their sync token |
| `src/lib/noteThread.ts` | Issue format, kinds and status rules, shared by the app and the script |
| `notes.ts` | Lists actionable notes, claims them, posts tagged replies, waits for the Pages deploy, sends Pushover notifications |
| `urgent-workflow.yml` | GitHub Action for Broken / Wrong info / Glitch notes; lives in the data repo as `.github/workflows/urgent.yml` |
| `routine-prompt.md` | Prompt for the hourly cloud routine (6 AM–midnight Japan time, Nov 10–28 = `0 21-23,0-15 10-28 11 *` UTC): https://claude.ai/code/routines/trig_014F2KWRY9dUhyG2dir4uxfu, no connectors, its own environment "Japan app loop" |

## Secrets (Matt adds these; never paste them in chat)

Data repo → Settings → Secrets and variables → Actions, and the same names (except `ANTHROPIC_API_KEY`) as
environment variables on the cloud routine's environment:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Console key with a monthly limit (Action only) |
| `LOOP_GH_TOKEN` | Fine-grained token `jtc-loop`: `japan-trip-tools` Contents read/write + Actions read; `japan-trip-tools-data` Issues read/write |
| `PUSHOVER_TOKEN`, `PUSHOVER_USER` | Pushover application token and user key (same as the itinerary loop) |

## Updating the workflow

```
gh api -X PUT repos/mdigirol/japan-trip-tools-data/contents/.github/workflows/urgent.yml \
  -f message="Update urgent workflow" -f content="$(base64 -i scripts/loop/urgent-workflow.yml)" \
  -f sha="$(gh api repos/mdigirol/japan-trip-tools-data/contents/.github/workflows/urgent.yml -q .sha)"
```
(Leave out the `-f sha=…` line the first time.)

## While the loop runs

The loop commits and pushes `main` from the cloud. Before editing locally, `git pull`.

Working notes from the command line: `gh issue list -R mdigirol/japan-trip-tools-data --label note`.
