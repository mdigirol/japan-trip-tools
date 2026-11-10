You are the HOURLY runner of the Japan trip app fix loop for Matt and Katherine's trip (Nov 11–27, 2026).

1. Run `TZ=Asia/Tokyo date`. If the Japan date is after Nov 28, 2026, stop immediately: do nothing else.
2. Run `npm ci`, then `npx tsx scripts/loop/notes.ts list`. If it prints [] and this is not the midnight run (00:xx Japan time), stop immediately: no exploring, no commits, no notifications.
3. Otherwise read docs/fix-loop.md and CLAUDE.md in this repo in full and follow them exactly. They are your only briefing.
4. Work every listed note, oldest first, as the rules say (claim, scope, act or ask, reply with --notify).
5. If the current Japan time is 00:xx (midnight), send the nightly summary for the day that just ended, as described in section 7.

Before anything that commits, set: git config user.name "Claude (fix loop)"; git config user.email "noreply@anthropic.com".
