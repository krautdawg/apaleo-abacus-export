## 1. Scheduler

- [ ] 1.1 Set the default of `schedule.timezone` to `Europe/Zurich` in `src/core/config.ts` and every time-zone example message ("for example Europe/Zurich")
- [ ] 1.2 Update `test/schedule/` and `test/cli/schedule.test.ts` to the Zurich scenarios; the times stay as they were (CET/CEST)

## 2. Container

- [ ] 2.1 `docker-compose.example.yml`: commented `APALEO_ABACUS_TIMEZONE: Europe/Zurich`; comments in Swiss Standard German (no "ß"); `.env.example` comments likewise
- [ ] 2.2 `Dockerfile`: OCI description "apaleo -> Abacus Finanzbuchhaltung export (AbaConnect XML Buchungen)"
- [ ] 2.3 `.github/workflows/ci.yml` `docker` job: check `demo-output/BSP/2026-09/ABACUS_Buchungen_20260901-20260930_BSP_DEMO.xml`; assert the description label names apaleo and Abacus

## 3. Docs

- [ ] 3.1 Rewrite `docs/docker.md` in Swiss Standard German ("du", no "ß"): build, compose loop, host-cron alternative, file locations for the Treuhänder, handover, the demo in the image (`-w /data`, uid 1000), the `chown` hint for `E-EXPORT`
- [ ] 3.2 `docs/configuration.md`: `schedule.timezone` default and the cadence table with Swiss examples

## 4. Release check

- [ ] 4.1 `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` green
- [ ] 4.2 `docker build -t apaleo-abacus-export:ci .`, the three CI commands and the demo-file check pass locally; nothing is pushed
