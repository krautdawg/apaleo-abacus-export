## Context

The scheduler (`src/schedule/`) and the container setup are target-independent and were proven in the DATEV and BMD projects: `schedule --once` from cron or a compose loop, monthly (day 1-5) or daily (D-1 to D-3) cadence, the night-audit rule (a period ending on D is final from `finalAfter` on D+2) and catch-up. Only the defaults and the wording are Austrian. Switzerland and Austria share CET/CEST, so every time in the scenarios stays the same.

## Goals / Non-Goals

**Goals:**
- Swiss defaults (`Europe/Zurich`) and Swiss documentation of unattended runs.
- CI proves the image builds and writes the Abacus demo file.

**Non-Goals:**
- New cadences (weekly, as the paid connector offers) or delivery channels; both stay in `## Später geplant` if users ask.

## Decisions

1. **Change only the default time zone.** A hotel with an explicit `schedule.timezone` is unaffected; properties keep their own apaleo time zone for the "final" check. Alternative: derive the default from the first property's time zone. Rejected: `schedule --once` decides before it reads properties, and the explicit default is easier to document.
2. **Keep monthly day 3 and daily D-2 as defaults.** They match the paid connector's recommendation (D-2, "es muss sichergestellt werden, dass zu dieser Uhrzeit der Night Audit fertig ist") and the engine's night-audit rule.
3. **No delivery code.** The Treuhänder fetches the files from a shared folder or the hotel sends them; e-mail and S3 are out of scope (no secrets for mail servers, no cloud). `docs/docker.md` says so plainly.

## Risks / Trade-offs

- [A hotel outside Switzerland uses the tool with the new default] → `doctor` prints the effective time zone; `docs/configuration.md` documents `schedule.timezone`.

## Open Questions

None.
