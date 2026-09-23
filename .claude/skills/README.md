# Skills

Skills installed in this project, vendored as editable files (not the managed plugin).

## teach

Stateful, agent-led learning: interviews you on your goal/level/time budget, tracks
progress in a workspace folder, and produces self-contained HTML lessons with quizzes.
Invoke with `/teach` inside a dedicated (non-code) workspace folder.

## grill-me / grilling

A relentless, branch-by-branch interview that stress-tests a plan or idea before you
act on it — always proposes ~3 options plus a recommendation, never leaves a choice
open. `grill-me` just forwards to the shared `grilling` skill. Invoke with `/grill-me`.

## Source

Vendored from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT license,
see `LICENSE-mattpocock-skills` in this directory) by Matt Pocock. To update, re-copy
the relevant folders from `skills/productivity/` in that repo.

If you'd rather have these auto-update instead of vendoring them, install the official
plugin instead: `/plugin install mattpocock-skills`.
