## MODIFIED Requirements

### Requirement: Example output and demo mode
The repository SHALL contain `docs/examples/` with a golden Abacus XML Buchungen file, its protocol text and a filled sample mapping CSV from the KMU hotel template for the demo "Hotel Beispiel", linked from the README and the mapping guide, and `apaleo-abacus export --demo` SHALL run the pipeline on bundled demo data with no config, secret or network, marking its output as demo.

#### Scenario: Treuhänder reviews before setup
- **WHEN** a Treuhänder opens `docs/examples/`
- **THEN** they find an `ABACUS_Buchungen_*.xml` file, its protocol and the mapping that produced it, and a test guarantees the XML file equals the current golden output

#### Scenario: Demo without credentials
- **WHEN** someone runs `apaleo-abacus export --month 2026-09 --demo --dry-run` with no config file and no `APALEO_CLIENT_SECRET`
- **THEN** the summary is printed with a `DEMO` marker, no network call is made, and the exit code is 0

#### Scenario: Demo file is marked in its name
- **WHEN** someone runs `apaleo-abacus export --month 2026-09 --demo` without `--dry-run`
- **THEN** the file is written below `./demo-output/` as `ABACUS_Buchungen_20260901-20260930_BSP_DEMO.xml`, every `Text1` starts with `DEMO `, and the protocol's first line is `DEMO`, so it never looks like a real export in a file list or in Abacus

#### Scenario: Demo in the Docker image
- **WHEN** someone runs the real demo in the image with `-w /data` and a data folder owned by uid 1000, as docs/docker.md shows
- **THEN** the files appear in that folder under `demo-output/`, and CI runs exactly that; without a writable working directory the run fails with `E-EXPORT` and a hint naming `-w /data`
