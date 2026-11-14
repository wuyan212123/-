# Skill sources

Vendored copies of third-party skills, reviewed before install. Update by re-cloning upstream, re-reading the diff, and re-applying the local patches below.

| Upstream repo | Commit | Date | Skills |
|---|---|---|---|
| anthropics/skills | 2c5958e | 2026-11-06 | frontend-design, webapp-testing |
| pbakaus/impeccable | 5ffe90b | 2026-11-13 | impeccable |
| obra/superpowers | 22f0b46 | 2026-11-03 | brainstorming, writing-plans, executing-plans, subagent-driven-development, dispatching-parallel-agents, test-driven-development, systematic-debugging, requesting-code-review, receiving-code-review, verification-before-completion, finishing-a-development-branch, using-git-worktrees, using-superpowers, writing-skills, diagnosing-superpowers |
| heygen-com/hyperframes | 50c21c3 | 2026-11-14 | hyperframes, hyperframes-cli, hyperframes-registry, media-use, figma, remotion-to-hyperframes, reverse-any-video, slideshow, style-sampling |
| remotion-dev/skills | 7e541aa | 2026-11-11 | remotion-* (13) |
| hugohe3/ppt-master | b243a95 | 2026-11-13 | ppt-master |
| op7418/guizang-ppt-skill | 93d21bf | 2026-10-30 | guizang-ppt (AGPL-3.0) |
| zarazhangrui/frontend-slides | 9906a34 | 2026-06-23 | frontend-slides |
| nextlevelbuilder/ui-ux-pro-max-skill | 6ae86f6 | 2026-11-10 | ui-ux-pro-max |
| digitalsamba/claude-code-video-toolkit | 9b0c90d | 2026-11-12 | video-ffmpeg, video-playwright-recording |
| microsoft/playwright-cli | b217248 | 2026-11-11 | playwright-cli |
| vercel-labs/agent-skills | 1a2c79d | 2026-10-27 | vercel-react-best-practices, vercel-composition-patterns |
| getsentry/skills | e94f222 | 2026-11-05 | commit, pr-writer, skill-scanner |
| shadcn-ui/ui | e62c943 | 2026-11-13 | shadcn |
| addyosmani/web-quality-skills | afa8da9 | 2026-08-24 | web-quality-audit |
| antfu/skills | d524ed2 | 2026-11-11 | vitest |
| op7418/Humanizer-zh | f4518a8 | 2026-09-23 | humanizer-zh |
| mattpocock/skills | 5863806 | 2026-11-12 | handoff |
| anthropics/claude-plugins-official | b5b01ac | 2026-11-14 | claude-md-improver |

## Local patches

- `disable-model-invocation: true` added to: using-superpowers, using-git-worktrees, writing-skills, diagnosing-superpowers, ui-ux-pro-max, video-playwright-recording, claude-md-improver, skill-scanner (handoff ships with it).
- brainstorming: description narrowed to new software features with unclear requirements.
- handoff: saves to `docs/handoff/` in the repo instead of `$TMPDIR` (cloud containers are ephemeral).
- HyperFrames skills: removed "Usage beacon" (`npx hyperframes events`) telemetry instructions; `HYPERFRAMES_NO_TELEMETRY=1` set in `.claude/settings.json`.
- media-use: replaced "Don't volunteer prices" with a rule to state estimated cost before paid generation.
- Removed bundled upstream test files (ppt-master `scripts/tests`, media-use `*_test.py`, ui-ux-pro-max `scripts/tests`) and eval folders.

## Removed (2026-11-14)

output-skill, redesign-skill, taste-skill (old 2.1), soft-skill, minimalist-skill, brutalist-skill (upstream merged/removed/moved); design (paid image APIs), design-system, ui-styling (replaced by shadcn); video-remotion, video-moviepy (duplicate of official Remotion / niche); 12 old HyperFrames sub-skills (upstream consolidated into `hyperframes` references).

## Considered, not installed

GordenSun/GordenPPTSkill (instructs a remote self-update on every use; 102 MB templates; overlaps ppt-master).
