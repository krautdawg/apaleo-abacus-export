import { abacusMovements } from '../abacus/movements.js';
import type { AbacusBooking } from '../abacus/types.js';
import { depositMovement } from '../core/deposits.js';
import type { Finding } from '../core/findings.js';
import { negateDecimal, sumDecimals } from '../core/money.js';
import type { LedgerLine } from '../core/source.js';
import type { ApaleoVat } from './apaleo-vat.js';
import type { PostedSide } from './guard.js';
import { SKIP_REASONS, type PostingSummary, type SkipReason, type VatTotal } from './types.js';

/** Abacus account numbers in numeric order: shorter before longer numbers. */
const byNumber = (a: string, b: string) => a.length - b.length || a.localeCompare(b);

const CITY_TAX_TYPES: ReadonlySet<string> = new Set(['CityTaxes', 'SecondCityTax', 'GuestLevies']);

/** Signed amount for a type: positive when an account of the type is credited, negative when debited, 0 when absent. */
function creditedAmount(line: LedgerLine, types: ReadonlySet<string> | string): number {
  const has = (type: string) => (typeof types === 'string' ? type === types : types.has(type));
  return (has(line.credit.type) ? line.grossCents : 0) - (has(line.debit.type) ? line.grossCents : 0);
}

/** The MWST of the bookings per rate, signed as owed (a credited Single account owes it), so a write-off or an allowance reduces it. */
export function taxByRate(bookings: readonly Pick<AbacusBooking, 'tax'>[]): { ratePercent: number; taxCents: number }[] {
  const totals = new Map<number, number>();
  for (const { tax } of bookings) if (tax) totals.set(tax.percent, (totals.get(tax.percent) ?? 0) - tax.taxCents);
  return [...totals].sort(([a], [b]) => a - b).map(([ratePercent, taxCents]) => ({ ratePercent, taxCents }));
}

interface VatEntry {
  mwstCode: string;
  rate: number;
  net: number;
  vat: number;
  apaleo: string[];
}

/** Collects the totals of a posting run while bookings are produced. */
export class SummaryBuilder {
  private readonly accounts = new Map<string, { soll: number; haben: number }>();
  private readonly revenue = new Map<string, VatEntry>();
  private readonly depositVat = new Map<string, VatEntry>();
  private readonly writeOffs = new Map<string, VatEntry>();
  private readonly payments = new Map<string, number>();
  private readonly skipped = new Map<SkipReason, { lines: number; gross: number }>();
  private cityTax = 0;
  private readonly deposits = { receivedCents: 0, releasedCents: 0, refundedCents: 0 };
  private accountsReceivable = 0;
  private rounding = 0;

  /** `apaleoVat` is what `apaleoVatOf` gives for the line. */
  addBooking(line: LedgerLine, booking: AbacusBooking, debit: PostedSide, credit: PostedSide, roundingCents: number, apaleoVat: readonly ApaleoVat[]): void {
    for (const [account, cents] of abacusMovements(booking)) {
      const entry = this.account(account);
      if (cents > 0) entry.soll += cents;
      else entry.haben -= cents;
    }
    this.rounding += roundingCents;

    // The VAT side is the Single account: credited with `D`, so its gross is owed (positive) then.
    const singleCredited = booking.debitCredit === 'D' ? 1 : -1;
    const tax = booking.tax;
    const side = (type: string) => (credit.ref.type === type ? credit : debit.ref.type === type ? debit : undefined);
    const revenue = side('Revenues');
    const deposit = revenue ? undefined : side('Liabilities');
    const vatSide = revenue ?? deposit;
    if (vatSide) {
      const owed = tax && vatSide.vat
        ? { net: singleCredited * booking.grossCents + tax.taxCents, vat: -tax.taxCents }
        : { net: creditedAmount(line, vatSide.ref.type), vat: 0 };
      const code = tax && vatSide.vat ? tax.mwstCode : '';
      addVat(revenue ? this.revenue : this.depositVat, code, tax && vatSide.vat ? tax.percent : 0, owed, apaleoVat.map((vat) => vat.precise));
    }
    const loss = vatSide ? undefined : side('LossOfAccountsReceivable');
    if (loss) {
      // Written off (positive) when the write-off account is debited, so apaleo's VAT (signed as owed) is negated.
      const taxed = loss.vat ? tax : undefined;
      const written = taxed
        ? { net: -singleCredited * booking.grossCents - taxed.taxCents, vat: taxed.taxCents }
        : { net: -creditedAmount(line, loss.ref.type), vat: 0 };
      addVat(this.writeOffs, taxed?.mwstCode ?? '', taxed?.percent ?? 0, written, apaleoVat.map((vat) => negateDecimal(vat.precise)));
    }
    this.cityTax += creditedAmount(line, CITY_TAX_TYPES);
    for (const payment of [debit, credit]) {
      if (payment.ref.type !== 'Payments') continue;
      const signed = payment === debit ? line.grossCents : -line.grossCents;
      this.payments.set(payment.row.abacusAccount, (this.payments.get(payment.row.abacusAccount) ?? 0) + signed);
    }
    const movement = depositMovement(line);
    if (movement?.direction === 'increase') this.deposits.receivedCents += movement.cents;
    if (movement?.direction === 'decrease') this.deposits.releasedCents += movement.cents;
    if (movement?.direction === 'decrease' && movement.viaPayment) this.deposits.refundedCents += movement.cents;
    this.accountsReceivable -= creditedAmount(line, 'AccountsReceivable');
  }

  addSkipped(reason: SkipReason, line: LedgerLine): void {
    const entry = this.skipped.get(reason) ?? { lines: 0, gross: 0 };
    entry.lines += 1;
    entry.gross += Math.abs(line.grossCents);
    this.skipped.set(reason, entry);
  }

  build(findings: readonly Finding[]): PostingSummary {
    const counts = new Map<string, number>();
    for (const finding of findings) counts.set(finding.code, (counts.get(finding.code) ?? 0) + 1);
    return {
      accounts: [...this.accounts]
        .sort(([a], [b]) => byNumber(a, b))
        .map(([account, { soll, haben }]) => ({ account, sollCents: soll, habenCents: haben, balanceCents: soll - haben })),
      revenueByRate: vatTotals(this.revenue),
      depositVatByRate: vatTotals(this.depositVat),
      writeOffsByRate: vatTotals(this.writeOffs),
      cityTaxCents: this.cityTax,
      payments: [...this.payments].sort(([a], [b]) => byNumber(a, b)).map(([account, cents]) => ({ account, cents })),
      deposits: { ...this.deposits },
      accountsReceivableCents: this.accountsReceivable,
      skipped: SKIP_REASONS.flatMap((reason) => {
        const entry = this.skipped.get(reason);
        return entry ? [{ reason, lines: entry.lines, grossCents: entry.gross }] : [];
      }),
      roundingCents: this.rounding,
      findings: [...counts].sort(([a], [b]) => a.localeCompare(b)).map(([code, count]) => ({ code, count })),
    };
  }

  private account(number: string): { soll: number; haben: number } {
    let entry = this.accounts.get(number);
    if (!entry) {
      entry = { soll: 0, haben: 0 };
      this.accounts.set(number, entry);
    }
    return entry;
  }
}

function addVat(totals: Map<string, VatEntry>, mwstCode: string, rate: number, { net, vat }: { net: number; vat: number }, apaleoPrecise: readonly string[]): void {
  const key = `${mwstCode}\u0000${rate}`;
  const entry = totals.get(key) ?? { mwstCode, rate, net: 0, vat: 0, apaleo: [] };
  entry.net += net;
  entry.vat += vat;
  entry.apaleo.push(...apaleoPrecise);
  totals.set(key, entry);
}

/** One total per MWST-Code and rate, by rate and then code (no code first). */
function vatTotals(entries: ReadonlyMap<string, VatEntry>): VatTotal[] {
  return [...entries.values()]
    .sort((a, b) => a.rate - b.rate || a.mwstCode.localeCompare(b.mwstCode))
    .map(({ mwstCode, rate, net, vat, apaleo }) => ({ mwstCode, ratePercent: rate, netCents: net, vatCents: vat, grossCents: net + vat, apaleoVat: sumDecimals(apaleo) }));
}
