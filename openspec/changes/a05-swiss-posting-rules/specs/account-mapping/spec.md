## ADDED Requirements

### Requirement: Swiss special-case warnings
`mapping check` SHALL warn `W-KURTAXE-TAXED` for a CityTaxes, SecondCityTax or GuestLevies row with an MWST-Code and a rate above 0, explaining that a guest-owed Kurtaxe that is invoiced separately and forwarded is a durchlaufender Posten without MWST and that only a hotel-owed Beherbergungsabgabe, a Kurtaxe that is not invoiced separately or the part kept by the hotel is taxable at 3.8 % (ESTV MBI 08 Ziff. 7.11); and SHALL warn `W-ANNULLATION-TAXED` for a revenue row of apaleo's groups `RevenueCancellationFees` or `RevenueNoShow`, or whose name matches cancellation or no-show payments, with a rate above 0, explaining that Annullationen and no-shows are Schadenersatz without MWST unless the service was already invoiced without a correction document (Ziff. 8.7). Both warnings SHALL name the row and its line and SHALL NOT change the exit code.

#### Scenario: Kurtaxe mapped with MWST
- **WHEN** a CityTaxes row maps to `3400` with MWST-Code `313` and `mwst_percent` 3.8
- **THEN** `mapping check` warns `W-KURTAXE-TAXED` naming the row, its line and Ziff. 7.11, and exits with code 0 if nothing else fails

#### Scenario: Kurtaxe as durchlaufender Posten
- **WHEN** a CityTaxes row maps to `2210` without MWST-Code
- **THEN** no `W-KURTAXE-TAXED` is raised

#### Scenario: No-show mapped with MWST
- **WHEN** the row `RevenueNoShow_Special:3.80;Revenues` maps to `3400` with MWST-Code `313` and `mwst_percent` 3.8
- **THEN** `mapping check` warns `W-ANNULLATION-TAXED` naming the row and Ziff. 8.7, and exits with code 0 if nothing else fails
