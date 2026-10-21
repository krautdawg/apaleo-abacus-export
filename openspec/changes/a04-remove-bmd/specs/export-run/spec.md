## MODIFIED Requirements

### Requirement: Currency of the target
The export SHALL ask the configured `TargetWriter` for the currency it books in and SHALL refuse with `E-CURRENCY`, per property-month and before writing, a property whose currency differs from it (without reading the ledger) and a month with any ledger line in another currency, naming both currencies and saying that the tool does not convert. The Abacus target SHALL answer with `abacus.leitwaehrung`.

#### Scenario: EUR property in a CHF Mandant
- **WHEN** the property's currency is EUR and `abacus.leitwaehrung` is `CHF`
- **THEN** `E-CURRENCY` names EUR and CHF, says that the Abacus file is booked in the Mandant's Leitwährung, the ledger is not read and no file is written for that property

#### Scenario: Swiss property
- **WHEN** the property's currency is CHF, `abacus.leitwaehrung` is `CHF` and all ledger lines are in CHF
- **THEN** no `E-CURRENCY` is raised and the Abacus file is written with `Currency` and `KeyCurrency` `CHF`

#### Scenario: Line in another currency
- **WHEN** `abacus.leitwaehrung` is `CHF` and one ledger line of the month is in EUR
- **THEN** `E-CURRENCY` names the number of such lines and both currencies, and no file is written for that property-month
