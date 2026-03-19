# Orchard Engine Design

## Vision

Orchard Engine is a merit-based farming-career game where growth is earned through consistency, quality, trust, and contribution. It is explicitly non-pay-to-win.

## 3 Layers

1. **Farm**: Player-level progression through daily/weekly/monthly growth loops.
2. **Commons**: Social trust layer for seed exchange, fruit sharing, circles, and peer validation.
3. **Market**: Recruiter-facing discovery and readiness scoring.

## Metaphor Dictionary

- roots = fundamentals
- trunk = depth
- branches = specialization
- leaves = activity
- fruits = completed outputs
- seeds = reusable knowledge
- water = consistency / energy
- minerals = rare insight resources
- soil = environment quality
- sunlight = opportunity exposure

## Player Loop

1. Join and get archetype + starter orchard.
2. Run daily quests and ship fruit outputs.
3. Share seeds/fruits in circles.
4. Receive peer validation and improve trust.
5. Harvest weekly and evaluate monthly promotion.
6. Improve profile visibility in market layer.

## Resource Model

Primary resources include water, minerals, soil quality, sunlight exposure, roots score, trunk score, fruits count, and seeds count.

## Ranking Logic

Ranking combines:

- consistency,
- quality,
- originality,
- peer usefulness,
- improvement trend.

Volume alone is insufficient to avoid spam-centric leaderboard behavior.

## Promotion Logic

Promotions are evaluated on 30-day windows using weighted merit signals and trust constraints.

## Four-Direction AI Pipeline

Inputs are structured as:

- player state,
- environment state,
- resource state,
- growth target.

AI output is advisory-only and decoupled from critical ranking/promotion writes.

## Entity Model

Core entities:

- Player
- OrchardProfile
- FarmState
- Quest
- Harvest
- PromotionReview
- Circle
- Validation
- TrustScore
- RecruiterView

## Anti-Abuse Rules

- no pay-to-win boosts,
- no pure volume ranking,
- suspicious reciprocity lowers trust confidence,
- repeated low-signal sharing is down-weighted,
- promotion requires minimum trust + consistency thresholds.

## Recruiter Layer

Recruiters browse read-optimized orchard summaries containing growth history, validated contribution, and hire readiness signals.

## Open Questions

- How to tune fairness weights across different archetypes?
- How to detect collusion rings without over-penalizing legitimate circles?
- What public/private boundary should trust traces expose to recruiters?
- Should promotion ladders differ by branch specialization?

---

## Wave 1 Simulation Layer (additive — added by simulation tooling)

### Simulation Goals

Validate that the Layer 1 (Farm) game loop is fair, balanced, and exploit-resistant before expanding to Layer 2 (Commons) or Layer 3 (Market). Specifically:

1. Consistent players should outperform spammers in ranking and promotion.
2. High-quality irregular players should still have a viable path to promotion.
3. Spammers should be structurally disadvantaged, not just slightly penalized.
4. Lazy players should not accidentally promote.
5. Fast learners should rise but not dominate disproportionately.
6. Promotion thresholds should be neither trivially easy nor impossibly strict.

### Synthetic Player Archetypes

| Archetype | Consistency | Quality | Completion | Spam Risk | Improvement | Integrity |
|---|---|---|---|---|---|---|
| slow-learner | 55% | 40% | 50% | 10% | 30% | 80% |
| fast-learner | 70% | 70% | 80% | 15% | 85% | 75% |
| spammer | 85% | 15% | 95% | 90% | 5% | 20% |
| consistent-player | 90% | 65% | 85% | 5% | 40% | 90% |
| lazy-player | 20% | 50% | 25% | 5% | 10% | 70% |
| high-potential-irregular | 35% | 85% | 40% | 5% | 60% | 85% |

Each archetype has ±6% jitter per player instance to avoid deterministic clones.

### Fairness Metrics

- **Spam Advantage Ratio**: spammer avg rank score / consistent-player avg rank score. Target: < 0.70.
- **Quality vs Volume**: high-quality players should outrank high-volume low-quality players.
- **Archetype Domination Risk**: no single archetype should hold >50% of the top quartile.
- **Promotion Rate by Archetype**: consistent-player should promote >50%; spammer should promote <30%.
- **Weekly Score Distribution**: standard deviation should not be extreme (healthy spread).

### Promotion Validation

30-day promotion requires ALL of:
- Roots ≥ 18
- Trunk ≥ 10
- Total fruits ≥ 6
- Average weekly score ≥ 40
- Spam days ≤ 3
- Consistency ≥ 50%

### Known Exploit Risks

1. **Volume flooding**: high completion rate with low quality to inflate activity metrics.
2. **Spam-and-coast**: short burst of spam outputs then low activity to hit fruit threshold.
3. **Quality-without-consistency**: sporadic high-quality work that games ranking but avoids sustained effort.
4. **No-fruit activity**: completing quests without ever producing output artifacts.

### Wave 1 Validation Workflow

1. Generate synthetic players using the Synthetic Player Generator (configurable archetype mix).
2. Run 30/60/90-day simulations using the Wave 1 Simulation Runner.
3. Analyze balance using the Balance Dashboard.
4. Review fairness verdict, issues, and archetype detail.
5. Tune promotion thresholds, ranking weights, or spam penalties as needed.
6. Re-run until verdict is BALANCED.
7. Only then proceed to Layer 2 (Commons) implementation.
