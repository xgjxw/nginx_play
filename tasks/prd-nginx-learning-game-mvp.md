# PRD: Nginx Learning Game MVP

## Introduction

Turn the current Nginx tower-defense shell into a real learning game for beginners. The MVP should teach request routing, reverse proxying, headers, auth, WebSocket upgrades, buffering, and cache behavior through editable configs, validation feedback, route traces, and log panels.

## Goals

- Make the first 10 lessons teach real Nginx cause-and-effect instead of abstract combat stats.
- Let a beginner read a scenario, edit a small config, run checks, and understand why the result changed.
- Keep the current single-page shell, but replace the battle loop with a lesson-validation loop.
- Move MVP lesson content toward an external content bundle instead of hard-coding everything in one runtime file.

## User Stories

### US-001: Complete the remaining request-routing lessons
**Description:** As a beginner, I want the route-matching lesson to validate which `location` wins so that I understand how Nginx chooses handlers.

**Acceptance Criteria:**
- [ ] Lesson 3 is interactive instead of scaffolded
- [ ] `/api/users` is validated against an API handler
- [ ] `/assets/app.js` is validated against a static handler
- [ ] Feedback explains why the chosen `location` matched
- [ ] Typecheck passes

### US-002: Complete the remaining proxy-header and auth lessons
**Description:** As a beginner, I want lessons for forwarded IP and Basic Auth to validate realistic proxy and access-control behavior so that I learn common production patterns.

**Acceptance Criteria:**
- [ ] Lessons 6 and 7 are interactive instead of scaffolded
- [ ] Real-IP lesson validates `X-Forwarded-For` chain preservation and `Host` forwarding
- [ ] Basic Auth lesson validates `/admin/` protection without locking the public site
- [ ] Validation feedback calls out common mistakes, not just pass/fail
- [ ] Typecheck passes

### US-003: Complete the remaining performance and cache lessons
**Description:** As a beginner, I want lessons for buffering and cache behavior to show concrete tradeoffs so that I can connect config changes to latency and cache-hit outcomes.

**Acceptance Criteria:**
- [ ] Lessons 9 and 10 are interactive instead of scaffolded
- [ ] Buffering lesson distinguishes streaming and download behavior
- [ ] Cache lesson validates cache zone setup, anonymous caching, and logged-in bypass behavior
- [ ] Metrics panel shows lesson-specific outputs for both lessons
- [ ] Typecheck passes

### US-004: Load lesson data from an external lesson bundle
**Description:** As a maintainer, I want the runtime to accept lesson content from external files so that lesson content can evolve without rewriting the runtime logic.

**Acceptance Criteria:**
- [ ] `learning-mode.js` loads lesson content from `content/lessons/index.js` when available
- [ ] Runtime falls back to built-in lesson definitions if the external bundle is missing
- [ ] External lesson records can be normalized into the current lesson runtime shape
- [ ] Existing lesson map and screen rendering still work after loading external content
- [ ] Typecheck passes

### US-005: Publish the MVP lesson bundle
**Description:** As a maintainer, I want all 10 MVP lessons represented in a lesson bundle so that the prototype is content-driven and easier to expand.

**Acceptance Criteria:**
- [ ] Add `content/lessons/index.js`
- [ ] The file exports all 10 MVP lessons
- [ ] The bundle includes enough fields to recreate lesson title, summary, scenario, objectives, source skills, and initial config
- [ ] The runtime can render the loaded lessons without manual edits to the lesson list
- [ ] Typecheck passes

## Functional Requirements

- FR-1: The game must expose all 10 MVP lessons as interactive lesson cards.
- FR-2: Each interactive lesson must provide editable config, validation checks, route trace, access log, error log, metrics, and review notes.
- FR-3: Validators must model realistic beginner mistakes for request routing, headers, auth, buffering, and caching.
- FR-4: The runtime must support external lesson content loading through a browser-safe script bundle.
- FR-5: Lesson content and lesson runtime must stay decoupled enough to allow future `SKILL.md -> lesson` generation.

## Non-Goals

- No return to the old combat loop as the primary gameplay.
- No full Nginx binary execution in the browser.
- No multiplayer, ranking, economy, or long-term progression systems in this MVP.
- No complete coverage of all 80+ Nginx skills in this phase.

## Technical Considerations

- The project is a static HTML/JS prototype, so content loading must work without a build step.
- The runtime should prefer browser-safe script loading over `fetch` from local files.
- Validators are lesson-specific simulators rather than a full parser or Nginx engine.
- The repo is not currently a git repository, so the Ralph loop can be represented by files and task structure but not run end-to-end as designed.

## Success Metrics

- All 10 MVP lessons open as interactive lessons.
- A learner can complete the first two chapters without falling back to the old tower-defense flow.
- Validation output explains the key Nginx concept in each lesson.
- Lesson content can be updated from an external bundle instead of only inside `learning-mode.js`.

## Open Questions

- Whether to move from lesson-specific regex validators to a shared Nginx simulation layer after the MVP.
- Whether to generate the external lesson bundle directly from `SKILL.md` content in the next phase.
