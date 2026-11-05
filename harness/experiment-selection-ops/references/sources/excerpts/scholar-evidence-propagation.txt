# Evidence Propagation

Use this file to keep `results-analysis` outputs aligned with the final report.

## Mapping rule

- `analysis-report.md` -> main findings and narrative summary
- `analysis-report.md#Claim Candidates` -> claim wording, uncertainty, and decisions that can be carried into the report
- `stats-appendix.md` -> test choice, uncertainty, effect size, correction rule
- `figure-catalog.md` -> figure purpose and per-figure interpretation scaffolding
- figure files -> visual evidence cited in `Figure-by-Figure Interpretation`

## Minimum statistical carry-over

Every strong claim in a results report should preserve:
- sample size or run/seed count,
- metric definition,
- uncertainty summary,
- test name,
- effect size when relevant,
- multiple-comparison handling when relevant.

## Unsupported claim rule

If the analysis bundle does not support a claim strongly enough, keep the claim tentative and say why.
Do not upgrade a suggestive result into a decisive conclusion during report writing.

## Claim candidate carry-over

Every claim carried from `results-analysis` should preserve:
- the source evidence,
- the allowed wording,
- the forbidden stronger wording,
- uncertainty,
- next check or decision.

Do not convert `speculative` or `observed` claims into decisive conclusions. The `What Changed Our Belief` section should cite either a Claim Candidate or an Evidence Record, not only free-form prose.
