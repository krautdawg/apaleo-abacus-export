## Why

Swiss hotels run in `Europe/Zurich`, and the Treuhänder expects the monthly Abacus file early in the following month, like the paid connector delivers it (day 1-5, daily D-2 recommended). The scheduler still defaults to `Europe/Vienna` and its spec names `apaleo-bmd`; the container check and `docs/docker.md` still describe BMD files. This slice makes running the tool unattended Swiss.

## What Changes

- `schedule.timezone` defaults to `Europe/Zurich`; cadences, `finalAfter`, catch-up and the night-audit rule stay unchanged; spec examples use Zurich and the `apaleo-abacus` command.
- `docker-compose.example.yml` and `.env.example` comments in Swiss Standard German; the compose example sets `APALEO_ABACUS_TIMEZONE` commented out with the default.
- The CI `docker` job checks `demo-output/BSP/2026-09/ABACUS_Buchungen_20260901-20260930_BSP_DEMO.xml`.
- `docs/docker.md` in Swiss Standard German: the loop, the host-cron alternative, where the Treuhänder finds the Abacus files, how to hand them over (shared folder, the Treuhänder's own transfer), and the demo in the image.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `scheduler`: default time zone `Europe/Zurich`, command name, Zurich examples.
- `container-deployment`: compose/env documentation and the demo-file check of the image.

## Non-goals

- No in-process daemon, no e-mail or S3 delivery, no registry image.
- No change of cadences or of the night-audit rule.

## Impact

- `src/core/config.ts` (default time zone), `src/schedule/`, tests under `test/schedule/` and `test/cli/schedule.test.ts`.
- `docker-compose.example.yml`, `.env.example`, `Dockerfile` labels (description), `.github/workflows/ci.yml`, `docs/docker.md`, `docs/configuration.md`.
