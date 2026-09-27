# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a personal Claude Code configuration repo, not a software project. There is no
build, lint, or test tooling — the entire content is `.claude/skills/`, a set of skills
vendored (copied as editable files, not installed as a managed plugin) from
[mattpocock/skills](https://github.com/mattpocock/skills).

## Structure

- `.claude/skills/teach/` — stateful, multi-session learning skill. Invoked with `/teach`
  inside a dedicated (non-code) workspace directory. It reads/writes a fixed set of files
  in that workspace (`MISSION.md`, `RESOURCES.md`, `NOTES.md`, `reference/*.html`,
  `learning-records/000N-*.md`, `lessons/000N-*.html`, `assets/*`) whose formats are defined
  in the sibling `*-FORMAT.md` files. See `.claude/skills/teach/SKILL.md` for the full
  philosophy (fluency vs. storage strength, zone of proximal development, etc.) before
  changing this skill's behavior.
- `.claude/skills/grilling/` — the actual interview logic: a relentless, round-by-round
  "design tree" interrogation that stress-tests a plan before acting on it. Each round asks
  every currently-answerable question with a numbered recommendation, waits for answers, then
  recomputes the frontier. Facts (from files/tools) are the agent's job to find via sub-agent;
  only genuine decisions go to the user.
- `.claude/skills/grill-me/` — a thin skill that just forwards (`Call the Skill tool with
  "grilling"`) to `grilling`. It exists only so `/grill-me` is a discoverable slash command;
  keep it a one-line forward rather than duplicating logic from `grilling`.
- `.claude/skills/README.md` — the source-of-truth summary of what's vendored and how to
  update it (re-copy from `skills/productivity/` in the upstream repo).
- `.claude/skills/LICENSE-mattpocock-skills` — MIT license covering the vendored skill content.

## Working in this repo

- There are no commands to build, lint, or test — changes are edits to Markdown/YAML skill
  definitions, verified by reading them, not by running anything.
- Skill front matter (`name`, `description`, `disable-model-invocation`, `argument-hint`)
  drives slash-command discovery and triggering; keep it accurate when editing a `SKILL.md`.
- When updating a vendored skill, prefer re-copying the corresponding folder from
  `mattpocock/skills` wholesale over hand-patching, to stay in sync with upstream; note in the
  commit if a local edit intentionally diverges from upstream.
- If asked to keep these skills auto-updating instead of vendored, the alternative is
  `/plugin install mattpocock-skills` rather than maintaining copies here.
