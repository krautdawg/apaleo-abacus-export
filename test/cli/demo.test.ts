import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../../src/cli/run.js';
import { fileSystemFinding } from '../../src/export/index.js';
import { createTestContext } from '../helpers/context.js';

/** The demo marks its file name with `_DEMO`, so it never looks like a real export in a file list. */
const FILE = 'ABACUS_Buchungen_20260901-20260930_BSP_DEMO.xml';
const PROTOCOL = 'ABACUS_Buchungen_20260901-20260930_BSP_DEMO.protokoll.txt';
/** What a real export of the demo data writes (test/examples.test.ts keeps it current). */
const EXAMPLE = readFileSync(new URL('../../docs/examples/ABACUS_Buchungen_20260901-20260930_BSP.xml', import.meta.url));
const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

/** No config file, no secret, and a fetch stub that throws on every request. */
function bareContext(env: Record<string, string> = {}) {
  return createTestContext({ env, fetchHandler: () => Promise.reject(new Error('the demo must not use the network')) });
}

describe('apaleo-abacus export --demo', () => {
  it('runs the dry run on the bundled data without config, secret or network and marks it DEMO', async () => {
    const ctx = bareContext();
    expect(await runCli(['export', '--month', '2026-09', '--demo', '--dry-run'], ctx)).toBe(0);
    const out = ctx.out();
    expect(out.startsWith('DEMO: bundled sample data of the fabricated "Hotel Beispiel"')).toBe(true);
    expect(out).toContain('Property BSP, 2026-09-01 to 2026-09-30: 31 apaleo lines, 26 Abacus bookings');
    expect(out).toContain('Never import a demo file into a real Abacus Mandant.');
    // Every section of the summary has content.
    for (const text of [
      `Import into Abacus FIBU (compare with the Mandant before importing, see docs/abacus-format.md):\n  File: ${FILE}\n  Bookings: 26 Einzelbuchungen`,
      '  Mandant: 7777, Geschäftsbereich 0, Leitwährung EUR',
      '  Belegnummern: 0901000001 to 0901000026',
      '  MWST-Codes: V10 (10 %; tax -58.48 EUR), V20 (20 %; tax -7.67 EUR)',
      'Totals per Abacus account',
      '  3805      50.00    0.00    50.00',
      '  V10 10 %: net 634.82, tax 63.48, gross 698.30, apaleo VAT 63.48, difference 0.00',
      '  V20 20 %: net 38.33, tax 7.67, gross 46.00',
      'Deposits and their MWST per MWST-Code and rate (received minus released):\n  no MWST-Code 0 %: net 0.00',
      'Written-off receivables (Debitorenverluste) and the MWST correction per MWST-Code and rate:\n  V10 10 %: net 50.00, tax 5.00, gross 55.00',
      'Kurtaxe and other guest levies (apaleo city tax): 6.40',
      'Payments per clearing account:\n  account  amount\n  1000      24.00\n  1090     556.70',
      'Deposits: received 395.00, released 395.00, of it refunded 10.00',
      'Accounts receivable (Debitoren, Soll positive): 115.00',
      'both sides on the same Abacus account      5            325.70',
      'Findings:\n  none',
    ]) {
      expect(out).toContain(text);
    }
    expect(out).toContain('File: a real run writes demo-output/BSP/2026-09/');
    expect(out).toContain('DEMO Result: dry run, nothing written; 1 file(s) passed every check.');
    expect(out).not.toContain('W-RECENT-DAY');
    expect(ctx.fetchCalls).toEqual([]);
    expect(ctx.err()).toBe('');
    expect(readdirSync(ctx.cwd)).toEqual([]);
  });

  it('does not count a month without bookings as a file that passed every check', async () => {
    const ctx = bareContext();
    expect(await runCli(['export', '--month', '2026-08', '--demo', '--dry-run'], ctx)).toBe(0);
    expect(ctx.out()).toContain('N-NO-BOOKINGS');
    expect(ctx.out()).toContain('DEMO Result: dry run, nothing written; 0 file(s) passed every check. 1 without bookings.');
  });

  it('Demo file is marked in its name: writes the example file into ./demo-output only, with DEMO in the file name, every Text1 and the protocol', async () => {
    // A variable that would redirect a real export must not move the demo output.
    const ctx = bareContext({ APALEO_ABACUS_OUTPUT_DIR: 'exports' });
    expect(await runCli(['export', '--month', '2026-09', '--demo'], ctx)).toBe(0);
    expect(readdirSync(ctx.cwd)).toEqual(['demo-output']);
    const folder = join(ctx.cwd, 'demo-output', 'BSP', '2026-09');
    expect(readdirSync(folder).sort()).toEqual([FILE, PROTOCOL, 'manifest.json'].sort());

    const demo = decode(readFileSync(join(folder, FILE)));
    // The example file with "DEMO " before every Text1, and nothing else changed.
    expect(demo).toBe(decode(EXAMPLE).replace(/<Text1>/g, '<Text1>DEMO '));
    const texts = [...demo.matchAll(/<Text1>([^<]*)<\/Text1>/g)].map((match) => match[1] ?? '');
    expect(texts).toHaveLength(2 * 26);
    expect(texts.every((text) => text.startsWith('DEMO '))).toBe(true);
    const protocol = readFileSync(join(folder, PROTOCOL), 'utf8').split('\n');
    expect(protocol[0]).toBe('DEMO');
    expect(protocol[1]).toMatch(/^DEMO: bundled sample data/);
    expect(ctx.fetchCalls).toEqual([]);

    // Running the demo again finds its own file and changes nothing.
    expect(await runCli(['export', '--month', '2026-09', '--demo'], ctx)).toBe(0);
    expect(readdirSync(folder).sort()).toEqual([FILE, PROTOCOL, 'manifest.json'].sort());
  });

  it('names the working directory, not ./data, when the demo folder is not writable', () => {
    const error = Object.assign(new Error("EACCES: permission denied, mkdir '/config/demo-output'"), { code: 'EACCES' });
    const finding = fileSystemFinding(error, '/config/demo-output', true);
    expect(finding.code).toBe('E-EXPORT');
    expect(finding.message).toContain('The demo writes into /config/demo-output');
    expect(finding.message).toContain('add -w /data');
    expect(finding.message).not.toContain('chown -R 1000:1000 data');
  });

  it('refuses --config, because the demo brings its own', async () => {
    const ctx = bareContext();
    expect(await runCli(['export', '--month', '2026-09', '--demo', '--config', 'mine.yaml'], ctx)).toBe(2);
    expect(ctx.err()).toContain('--demo brings its own config');
  });

  it('refuses a month that is not closed on the demo clock (2026-10-05)', async () => {
    const ctx = bareContext();
    expect(await runCli(['export', '--month', '2026-10', '--demo', '--dry-run'], ctx)).toBe(1);
    expect(ctx.out()).toContain('E-DAY-NOT-CLOSED');
    expect(existsSync(join(ctx.cwd, 'demo-output'))).toBe(false);
  });
});
