# PRD: Nginx Learning Game Education Impact

## Introduction

The game already has 10 interactive lessons, but interactivity alone does not guarantee learning. This phase makes the prototype educational by forcing each lesson to teach an explicit concept, surface common misconceptions, explain cause and effect from the config, and give the learner a structured recap they can carry into real Nginx work.

## Goals

- Make every MVP lesson teach one clear Nginx concept instead of only rewarding trial and error.
- Turn validator output into explanation, not just grading.
- Connect each failed check to a specific misconception and recovery hint.
- End each lesson with a reusable mental model, not just a completion state.

## User Stories

### US-001: Add explicit teaching metadata to lesson content
**Description:** As a learner, I want each lesson to state what I am learning and what mistake it is correcting so that I know the point of the exercise.

**Acceptance Criteria:**
- [ ] Each MVP lesson record includes `teaches`, `misconceptions`, and `whyItWorks` fields
- [ ] Each lesson record includes at least one misconception tied to the lesson topic
- [ ] The external lesson bundle remains loadable by the runtime
- [ ] Typecheck passes

### US-002: Show learning objectives and misconceptions in the lesson UI
**Description:** As a learner, I want to see the lesson's concept target and likely mistakes before editing config so that I can approach the exercise intentionally.

**Acceptance Criteria:**
- [ ] The lesson screen shows a "You are learning" section
- [ ] The lesson screen shows a "Common mistakes" section before validation
- [ ] These sections render from lesson content instead of hard-coded copy
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Turn validation output into a structured teaching debrief
**Description:** As a learner, I want post-run feedback to explain why the config worked or failed so that I build a correct mental model.

**Acceptance Criteria:**
- [ ] The lesson result area shows a structured "Why this works" section after validation
- [ ] Failed runs show lesson-specific recovery hints instead of only generic review notes
- [ ] Successful runs still explain the underlying Nginx behavior
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Map failed checks to misconception-specific hints
**Description:** As a learner, I want each failed check to point to the misconception behind it so that I can correct the real misunderstanding, not just patch the config.

**Acceptance Criteria:**
- [ ] The validator result model supports hint keys or hint text per failed check
- [ ] At least the route, proxy, auth, websocket, and cache lessons expose specific failed-check hints
- [ ] The lesson UI renders those hints next to failed checks
- [ ] Typecheck passes

### US-005: Add a mastery recap after lesson completion
**Description:** As a learner, I want a short mastery recap after I pass a lesson so that I remember the rule, the symptom, and the next related topic.

**Acceptance Criteria:**
- [ ] Passed lessons show a recap block with "Rule", "Symptom", and "Next skill"
- [ ] The recap content comes from lesson data where possible
- [ ] The recap appears only after successful completion
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Lesson content must carry teaching metadata in addition to scenario and config data.
- FR-2: The runtime must render pre-validation teaching context and post-validation teaching debrief separately.
- FR-3: Validators must be able to attach lesson-specific hints to failed checks.
- FR-4: Completion must produce a compact recap that reinforces transfer to real Nginx work.

## Non-Goals

- No new chapter expansion beyond the current 10 MVP lessons in this phase.
- No full quiz system or spaced repetition engine yet.
- No replacement of lesson-specific validators with a full Nginx parser in this phase.

## Technical Considerations

- The project remains a static HTML/JS prototype with no build step.
- Teaching metadata should live in lesson content, not in scattered UI strings.
- The current runtime already supports external lesson loading, so this phase should build on that path rather than re-centralizing content.

## Success Metrics

- Every MVP lesson exposes an explicit concept, misconception, and explanation path.
- Failed validation teaches the learner what they misunderstood.
- Passing a lesson leaves the learner with a short rule they can apply outside the game.

## Open Questions

- Whether to track mastery by concept in local storage after this phase.
- Whether to generate misconception and recap fields automatically from `SKILL.md` in the next phase.
