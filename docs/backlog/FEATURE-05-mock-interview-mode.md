# FEATURE-05: Mock Interview mode — a 25-minute simulated incident interview with a rubric debrief

**Audience fit:** The closest simulation of the real thing SDPD can offer. Real system-design/incident interviews chain reasoning under time pressure and end with an articulated postmortem; no existing mode exercises that.
**Effort:** ~1–1.5 weeks (v1, no AI). An optional AI-interviewer extension is sketched at the end but is NOT part of v1.
**Infra:** none for v1.

## Concept

`/interview` runs a structured session mimicking an incident-management interview round:

1. **Setup (30s):** pick a track — one of the existing 8 categories (`categoryKeys` ranges in `HomePage.tsx`, centralized per UX-03 §2) or "Full spectrum". The mode samples 3 cases from the track.
2. **Rounds 1–3 (≈6 min each):** three cases back-to-back, timed. Same investigation UI (diagram + inspector + diagnosis) with interview constraints: visible per-round countdown, **one attempt per question** (wrong is wrong — like an interview), and no Guide access (disable the header GUIDE toggle during a session).
3. **Postmortem (5 min):** free-text prompt for the worst-performed round: "Write the incident summary: what failed, why, and what you'd change" (min ~200 chars). A self-assessment rubric is revealed *after* writing (below).
4. **Debrief:** overall score, per-round breakdown, rubric self-scores, weak-concept list with Guide links and (if FEATURE-03 exists) one-click "add weak concepts to Notebook".

## Scoring

Per round: root cause correct on the single attempt = 2 pts, fix correct = 2 pts, time bonus 1 pt if under 4 minutes. Max 15 over three rounds. Interview-flavored verdicts rendered with the noir stamp aesthetic:

- 13–15 "STRONG HIRE" · 10–12 "HIRE" · 7–9 "LEAN HIRE" · below "KEEP TRAINING, DETECTIVE"

(Tongue-in-cheek game verdicts; playful tone so a bad run stings less.)

## The postmortem rubric (the pedagogical core)

After the free-text submission, reveal a 5-item self-check, each with a one-line "what good looks like" example authored per category — 8 categories × 5 lines is the only new content this feature requires (EN + pt-BR):

1. Did you state the *root cause* (not a symptom)?
2. Did you name the failing component and the propagation path?
3. Did you propose a fix that removes the cause *class*, not the instance?
4. Did you mention a detection/prevention mechanism (alert, replica, circuit breaker…)?
5. Did you note a trade-off of your fix?

Rubric scores are self-reported and **excluded from the point total** (keeps self-honesty cheap). The written postmortem + checked rubric are stored so players can reread their own writing — reviewing your own postmortems before an interview is genuinely valuable prep.

## State

localStorage `sdpd-interview-state` (versioned per ISSUE-03 pattern):

```json
{
  "schemaVersion": 1,
  "sessions": [
    {
      "id": "iv-2026-07-11T14:02",
      "track": "caching",
      "startedAt": "2026-07-11T14:02:11Z",
      "rounds": [
        { "caseId": "case-14", "rootCauseCorrect": true, "fixCorrect": false, "seconds": 231 }
      ],
      "postmortem": { "caseId": "case-15", "text": "…", "rubric": [true, true, false, true, false] },
      "score": 11
    }
  ]
}
```

Cap sessions at 50 (drop oldest). A session abandoned mid-way is discarded — never persist partial rounds; state this on the setup screen ("leaving ends the interview").

## Implementation notes

- **Case sampling:** random without replacement from the track's range; repeats across separate sessions are fine. Load via the same `useCase` loaders, ignoring campaign unlock state *within the session only*.
- **One-attempt mode:** `DiagnosisPanel` gets a mode prop — design it once for this and FEATURE-02: `mode: 'campaign' | 'drill' | 'interview'`. In `interview`, after submit show correct/incorrect + feedback, then auto-advance (no "Try Again").
- **Session state machine** in `src/hooks/useInterviewSession.ts`: `setup → round(1..3) → postmortem → debrief`. Compute countdowns from wall-clock deltas (`Date.now() - roundStartedAt`), not accumulated interval ticks.
- **No campaign gating**, but show a soft warning below 5 completed cases: "Detectives usually train before the exam."
- Route in `App.tsx`, `[ INTERVIEW ]` header link, Home promo card. All strings `interview.*` in both locales, including the 8×5 rubric example lines.

## v2 sketch (out of scope — do not build now)

An "AI interviewer" asking one follow-up question about the player's postmortem, via BYO-API-key client-side call or a small Cloudflare Worker proxy with a daily cap. Recorded here so the postmortem data model (free text stored per session) is designed to feed it later.

## Verification

1. Full manual session: per-round countdown; one attempt enforced; Guide disabled during and re-enabled after; mid-round abandon discards the session.
2. Score unit tests: verdict boundaries (6/7, 9/10, 12/13); time bonus at 3:59 vs 4:01.
3. Postmortems persist and are rereadable from a "Past interviews" list.
4. Both locales render every rubric line (no raw `interview.` keys leak in the UI).

## Acceptance criteria

- [ ] 3-round timed session, one-attempt questions, Guide disabled.
- [ ] Postmortem step with per-category rubric reveal, stored and rereadable.
- [ ] Verdict scoring unit-tested at boundaries; wall-clock timing.
- [ ] `DiagnosisPanel` mode prop shared with FEATURE-02, not forked.
- [ ] Campaign progression untouched by interview sessions.
- [ ] Full EN + pt-BR strings including rubric examples.
