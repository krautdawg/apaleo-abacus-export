## ADDED Requirements

### Requirement: Kurtaxe and guest levies
Lines on CityTaxes, SecondCityTax and GuestLevies accounts SHALL be booked through their mapping rows like any other line, so that a guest-owed Kurtaxe or Gästetaxe mapped to a liability (durchlaufender Posten) without MWST-Code is booked without `TaxData`, one mapped with an MWST-Code at rate 0 (for example a code for Ziffer 910) is booked with tax 0.00, and a levy that apaleo taxes (a hotel-owed Beherbergungsabgabe, or a Kurtaxe that is not invoiced separately) is booked on its row with the matching MWST-Code and rate; the VAT guard SHALL apply to all of them, and the posting module SHALL NOT change the tax apaleo charged. The summary SHALL show the levy total per Abacus account and whether it was booked with or without MWST.

#### Scenario: Guest-owed Kurtaxe
- **WHEN** a line debits guest receivables (`1101`) and credits the city-tax account mapped to `2210` without MWST-Code with gross 4.20 and a `Without` tax entry of 0 % and 0.00
- **THEN** the booking has Collective account `1101`, Single account `2210`, `DebitCredit` `D`, gross 4.20 and no `TaxData`, and the summary shows 4.20 Kurtaxe on `2210` without MWST

#### Scenario: Kurtaxe with a Ziffer-910 code
- **WHEN** the city-tax row maps to `2210` with MWST-Code `491` at rate 0 and a line credits it with gross 4.20 and no taxes
- **THEN** the booking has `TaxData` with `TaxCode` `491`, rate 0 and tax 0.00, and no `E-VAT-UNEXPECTED` is raised

#### Scenario: Taxed Beherbergungsabgabe
- **WHEN** a line credits a GuestLevies account mapped to `3400` with MWST-Code `313` at 3.8 %, with gross 2.08, net 2.00 and taxes 0.08 at 3.8 %
- **THEN** the booking has Single account `3400`, gross 2.08, tax −0.08 and MWST-Code `313`, and the summary counts it as a levy booked with MWST

#### Scenario: Taxed levy on an untaxed row
- **WHEN** a line with taxes 0.08 at 3.8 % credits a city-tax account mapped without MWST-Code
- **THEN** `E-VAT-MISSING` is raised and names the mapping row

### Requirement: Deposits and accounts receivable in Abacus
Prepayment lines (`PostPrepayment`) SHALL be booked to the mapped deposit account with the MWST of their rate, because an Anzahlung is taxed when it is received under both Abrechnungsarten (MWSTG Art. 40 Abs. 1 Bst. c and Abs. 2), and accounts-receivable lines (`PostToAccountsReceivables`) to the mapped Sachkonto, both under the VAT guard. A Liabilities side SHALL count as a deposit increase when it is credited with a positive amount or debited with a negative amount, and as a decrease otherwise; a decrease whose other side is a Payments account is a refund. This covers apaleo's real shapes: a release as `PostCharge` debit guest receivables, credit `<reservation>_Liabilities/<rate>` with negative gross and negative taxes, a refund as `PostPrepayment` with negative gross, and an overpayment parked on the 0 % deposit as `PostCharge` credit `<reservation>_Liabilities/Null:0.00` with positive gross. In the written file `abacus.abrechnungsart` SHALL change only `UseCode` and the Collective `TaxAccount`, never which lines are booked, their accounts, amounts or tax; what Abacus then does with the tax of a `vereinnahmt` booking is covered by "Vereinnahmte Entgelte".

#### Scenario: Prepayment at 3.8 %
- **WHEN** a line debits the Twint payment account (`1090`) and credits the guest liabilities 3.8 % account mapped to `2030` with MWST-Code `313` and rate 3.8, with gross 311.40, net 300.00 and taxes 11.40 at 3.8 %
- **THEN** the booking has Collective account `1090`, Single account `2030`, `DebitCredit` `D`, gross 311.40, tax −11.40 and MWST-Code `313`, and the summary shows 311.40 deposits received and 11.40 deposit tax at 3.8 %

#### Scenario: Same deposit with vereinnahmte Entgelte
- **WHEN** the same line is exported with `abacus.abrechnungsart: vereinnahmt`
- **THEN** the booking's accounts, gross and tax are unchanged, the file has `UseCode` `1` and the Collective `TaxAccount` `abacus.mwstHilfskonto`, and the export reports `W-ABRECHNUNGSART-VEREINNAHMT`

#### Scenario: Release as a negative charge
- **WHEN** a `PostCharge` line debits `ENG-ALPHA-1_Receivables` and credits `ENG-ALPHA-1_Liabilities/Special:3.80` (3.8 % wildcard, `2030`, MWST-Code `313`) with gross −207.60 and tax −7.60 at 3.8 %
- **THEN** the booking has Collective account `1101`, Single account `2030`, `DebitCredit` `C`, gross 207.60 and tax 7.60, and the summary counts 207.60 as released, not as received

#### Scenario: Refund of a deposit
- **WHEN** a `PostPrepayment` line debits the Twint payment account and credits `ENG-ALPHA-1_Liabilities/Special:3.80` with gross −103.80 and tax −3.80
- **THEN** the booking has Collective account `1090`, Single account `2030`, `DebitCredit` `C`, gross 103.80 and tax 3.80, and the summary counts 103.80 as released and, of the released, as refunded

#### Scenario: Overpayment parked on the 0 % deposit
- **WHEN** a `PostCharge` line debits `ENG-ALPHA-1_Receivables` and credits `ENG-ALPHA-1_Liabilities/Null:0.00` (0 % wildcard, `2039`) with gross 10.00 and no taxes
- **THEN** the booking has Collective account `1101`, Single account `2039`, `DebitCredit` `D`, gross 10.00, no `TaxData`, and the summary counts 10.00 as received

#### Scenario: Check-out on accounts receivable
- **WHEN** a line debits the AccountsReceivable account (mapped to `1102`) and credits guest receivables (`1101`) with gross 208.46 and receipt type Invoice number `ENG-2026-0815`
- **THEN** the booking has Collective account `1102`, Single account `1101`, `DebitCredit` `D`, gross 208.46 and `Text2` `ENG-2026-0815`

### Requirement: Vereinnahmte Entgelte
With `abacus.abrechnungsart: vereinnahmt`, `doctor` and every export (dry run included, once per run in the summary and the protocol) SHALL warn `W-ABRECHNUNGSART-VEREINNAHMT`, explaining that Abacus books the output tax of these bookings to the Hilfskonto (`abacus.mwstHilfskonto`) and moves it to the Steuerkonto only when a payment is recorded, normally in the Debitorenbuchhaltung, which this tool does not feed; that the file books the tax on the charge date while it legally arises at payment (MWSTG Art. 40 Abs. 2), which matters for charges on accounts receivable that are unpaid at period end; and that the Treuhänder must correct the Hilfskonto at period end as `docs/mapping-guide.md` describes, until a test import shows how Abacus treats FIBU-only bookings with `UseCode` `1` (research §9 open question 15). The warning SHALL NOT change the exit code, and `vereinbart` SHALL raise no such warning.

#### Scenario: Doctor with vereinnahmte Entgelte
- **WHEN** the config sets `abacus.abrechnungsart: vereinnahmt` and the user runs `doctor`
- **THEN** `doctor` warns `W-ABRECHNUNGSART-VEREINNAHMT` naming the Hilfskonto `2202` and `docs/mapping-guide.md`, and exits with code 0 if nothing else fails

#### Scenario: Export with vereinnahmte Entgelte
- **WHEN** the Swiss fixture month is exported with `abacus.abrechnungsart: vereinnahmt`
- **THEN** the summary and the protocol show `W-ABRECHNUNGSART-VEREINNAHMT` once, the file is written, and the exit code is 0

#### Scenario: Default Abrechnungsart
- **WHEN** `abacus.abrechnungsart` is not set
- **THEN** no `W-ABRECHNUNGSART-VEREINNAHMT` is raised

### Requirement: Bad debt with MWST correction
Lines that debit a LossOfAccountsReceivable account SHALL be booked through its mapping row: with tax entries, the write-off row SHALL carry the MWST-Code of the line's rate, so that the booking has the write-off account as Single account (debited, `DebitCredit` `C`), the gross amount and a positive tax that reduces the Umsatzsteuer (Entgeltsminderung, MWSTG Art. 41); without tax entries the row SHALL have no MWST-Code and the line is booked without `TaxData`. The posting summary SHALL show the total of written-off receivables per rate.

#### Scenario: Write-off with MWST correction
- **WHEN** a line debits a per-reservation LossOfAccountsReceivable account at 3.8 % (resolved through the wildcard to `3805`, MWST-Code `313`, rate 3.8) and credits guest receivables (`1101`) with gross 103.80, net 100.00 and taxes 3.80 at 3.8 %
- **THEN** the booking has Collective account `1101`, Single account `3805`, `DebitCredit` `C`, gross 103.80, tax 3.80 and MWST-Code `313`, and the summary shows 103.80 written off at 3.8 %

#### Scenario: Write-off without MWST
- **WHEN** a write-off line of 30.00 has no tax entries and debits an account mapped to `3808` without MWST-Code
- **THEN** the booking has Collective account `1101`, Single account `3808`, `DebitCredit` `C`, gross 30.00 and no `TaxData`

### Requirement: Annullationen and no-show payments
Annullation and no-show payments SHALL be booked through their revenue mapping rows like other revenue, with the rate apaleo charged and under the VAT guard; the posting module SHALL NOT change their tax. Without tax they SHALL be booked without `TaxData`, as Schadenersatz (ESTV MBI 08 Ziff. 8.7).

#### Scenario: Untaxed Annullation
- **WHEN** a line credits `RevenueCancellationFees_Without:0.00` mapped to `3680` without MWST-Code with gross 80.00 and no taxes
- **THEN** the booking has Collective account `1101`, Single account `3680`, `DebitCredit` `D`, gross 80.00 and no `TaxData`

#### Scenario: Taxed no-show on an untaxed row
- **WHEN** a no-show line with taxes 3.80 at 3.8 % credits an account mapped without MWST-Code
- **THEN** `E-VAT-MISSING` is raised and names the mapping row

### Requirement: Swiss fixture month
The test suite SHALL post a fabricated Swiss fixture month in CHF (property `ENG`, `Europe/Zurich`, August 2026, in `test/fixtures/apaleo/ch-month/` with a README naming every line), shaped like apaleo's recorded real data (eight-decimal net and tax, per-reservation accounts with `parentNumber`, `/Offset` second lines, releases as negative charges with `taxes[]`, no `PostPrepaymentVat`), covering rooms with breakfast at 3.8 %, a Halbpension package invoiced as a whole at 3.8 %, restaurant, drinks and minibar at 8.1 %, take-away food at 2.6 %, Kurtaxe without MWST, a deposit received at 3.8 %, released at check-out and partly refunded, an Annullation at 0 %, Twint, card, cash and invoice payments, an invoice on accounts receivable and a write-off with MWST correction, with the KMU hotel template mapping (default MWST-Codes, the Kurtaxe row filled in as a Treuhänder would) and `abacus.leitwaehrung: CHF`, and SHALL compare every summary value and every booking with hand-computed values recorded in the test, and the rendered file with a golden file.

#### Scenario: Totals of the Swiss month
- **WHEN** `test/posting/fixture-month-ch.test.ts` runs
- **THEN** revenue per MWST-Code and rate, tax per rate, Kurtaxe, deposits received, released and refunded, payments per clearing account, write-offs and the balance per Abacus account equal the recorded constants, every taxed booking carries `311` at 8.1 %, `312` at 2.6 % or `313` at 3.8 %, every amount is in whole Rappen without 5-Rappen rounding, and no `E-` finding is raised

#### Scenario: Golden file of the Swiss month
- **WHEN** the Swiss month is rendered with `abacusTarget`
- **THEN** the bytes equal `test/golden/abacus/ch-month.xml`, with `Currency` and `KeyCurrency` `CHF` in every booking
