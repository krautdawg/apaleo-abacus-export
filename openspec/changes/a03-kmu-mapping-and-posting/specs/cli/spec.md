## MODIFIED Requirements

### Requirement: Config file and environment loading
The CLI SHALL load configuration from the file given by `--config`, else from `APALEO_ABACUS_CONFIG`, else from `./apaleo-abacus.config.yaml`, accepting YAML or JSON. Values SHALL be validated against a schema, and every validation error SHALL name the offending key path. Secrets SHALL only be read from environment variables, and a secret key present in the config file SHALL be rejected. Environment overrides SHALL be limited to a documented allow-list of scalar keys; any other `APALEO_ABACUS_*` variable SHALL be rejected with an error naming it. A `bmd` or `datev` section SHALL be rejected with an error that names the `abacus` section. The `abacus` section SHALL be required and SHALL accept `mandant` (required, 1 to 6 digits, no default), `leitwaehrung` (`CHF` or `EUR`, default `CHF`), `abrechnungsart` (`vereinbart` or `vereinnahmt`, default `vereinbart`), `version` (`2015.00`, `2020.00`, `2022.00` or `2024.00`, default `2015.00`), `mwstKonto` (1 to 11 digits, default `2200`), `mwstHilfskonto` (1 to 11 digits, default `2202`), `mwstCodes.normal`, `mwstCodes.reduziert` and `mwstCodes.beherbergung` (1 to 3 characters of `A-Z`, `a-z`, `0-9`, defaults `311`, `312` and `313`) and `geschaeftsbereich` (0 to 99999999, default `0`), and each property MAY override `mandant` and `geschaeftsbereich`. `doctor` and the export protocol SHALL warn `W-MANDANT-SHARED` when two configured properties have the same effective Mandant and Geschäftsbereich. Variables of the former names (`APALEO_BMD_*`, `APALEO_DATEV_*`) SHALL NOT be read.

#### Scenario: Invalid config value
- **WHEN** the config file sets `abacus.geschaeftsbereich: -1`
- **THEN** loading fails with an error that names `abacus.geschaeftsbereich` and the allowed range

#### Scenario: Abacus section missing
- **WHEN** the config file has no `abacus` section
- **THEN** loading fails with an error that names `abacus.mandant` as required and points to `docs/configuration.md`

#### Scenario: Mandant missing
- **WHEN** the config file has an `abacus` section without `mandant`
- **THEN** loading fails with an error that names `abacus.mandant` as required and says that it is the Mandantennummer in Abacus

#### Scenario: Invalid Leitwährung
- **WHEN** the config file sets `abacus.leitwaehrung: USD`
- **THEN** loading fails with an error that names `abacus.leitwaehrung` and the allowed values `CHF` and `EUR`

#### Scenario: Abacus defaults
- **WHEN** the `abacus` section sets only `mandant: 1234`
- **THEN** the effective values are `leitwaehrung` `CHF`, `abrechnungsart` `vereinbart`, `version` `2015.00`, `mwstKonto` `2200`, `mwstHilfskonto` `2202`, `mwstCodes` `311`, `312`, `313` and `geschaeftsbereich` `0`

#### Scenario: Two properties share a Mandant
- **WHEN** properties `BSP` and `BS2` are configured with the same `abacus.mandant` and neither sets `geschaeftsbereich`
- **THEN** `doctor` warns `W-MANDANT-SHARED` naming both properties, and explains that their Belegnummern could repeat and that each property needs its own Geschäftsbereich or Mandant

#### Scenario: Old BMD section
- **WHEN** the config file contains `bmd.buchsymbol`
- **THEN** loading fails with an error saying that `bmd` is not a section of apaleo-abacus and naming `abacus`

#### Scenario: Old DATEV section
- **WHEN** the config file contains `datev.beraternummer`
- **THEN** loading fails with an error saying that `datev` is not a section of apaleo-abacus and naming `abacus`

#### Scenario: Secret in config file
- **WHEN** the config file contains `apaleo.clientSecret`
- **THEN** loading fails with an error telling the user to set `APALEO_CLIENT_SECRET` in the environment instead

#### Scenario: Syntax error does not quote the file
- **WHEN** the config file has a YAML or JSON syntax error next to a line such as `clientSecret: SUPERSECRET`
- **THEN** loading fails with an error that gives the file path, line, column and kind of error, and does not quote any content of the file

#### Scenario: Empty section or value
- **WHEN** a section such as `apaleo:` has all its keys commented out, or a value such as `abacus.mandant:` is left empty
- **THEN** the key is treated as missing, so defaults apply and a required key is reported as `is required`, whether or not an environment override is set

#### Scenario: Environment override
- **WHEN** `APALEO_ABACUS_OUTPUT_DIR=/data/out` is set and the file sets `output.dir: ./out`
- **THEN** the effective value of `output.dir` is `/data/out`

#### Scenario: Array key cannot be set from the environment
- **WHEN** `APALEO_ABACUS_PROPERTIES=BER,MUC` is set
- **THEN** loading fails with an error naming the variable and saying that `properties` is an array that can only be set in the config file

#### Scenario: Missing config file
- **WHEN** no config file exists at the resolved path and the subcommand needs config
- **THEN** the CLI exits with code 1 and prints the path it looked for and how to create the file

#### Scenario: Old variable names are not read
- **WHEN** only `APALEO_BMD_CONFIG=/x/old.yaml` is set and `./apaleo-abacus.config.yaml` exists
- **THEN** the CLI loads `./apaleo-abacus.config.yaml` and ignores the old variable
