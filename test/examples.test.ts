import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createSource } from '../src/cli/source.js';
import { DEMO_PROPERTY, demoRun } from '../src/demo/index.js';
import { runExport } from '../src/export/index.js';
import { checkMapping, parseMapping } from '../src/mapping/index.js';
import { createTestContext } from './helpers/context.js';
import { describeDifference } from './helpers/golden.js';

/**
 * `docs/examples/` shows a Treuhänder the output before any setup: what a real
 * export (not `--demo`, so without the DEMO marks) of the demo data in
 * `examples/demo/` writes. `examples/demo/` holds copies of the Hotel Beispiel
 * fixtures plus the demo-only days below. After an intended change to the
 * output, run `UPDATE_GOLDEN=1 pnpm test` and review the diff of docs/examples/.
 */
const UPDATE = process.env.UPDATE_GOLDEN === '1';
const root = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const read = (path: string) => readFileSync(root(path));
const FILE = 'ABACUS_Buchungen_20260901-20260930_BSP.xml';
const PROTOCOL = 'ABACUS_Buchungen_20260901-20260930_BSP.protokoll.txt';
/** The night of BSP-QRSTUV-1 that is never paid, and its write-off with the VAT correction: only in the demo. */
const DEMO_ONLY_DAYS = ['export-gross-daily/2026-09-25.json', 'export-gross-daily/2026-09-29.json'];

function filesIn(dir: string): string[] {
  return readdirSync(root(dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root(dir), join(entry.parentPath, entry.name)))
    .sort();
}

/** A real export of September 2026 on the demo data: the demo's config, clock and recorded source, without `demo`. */
async function exportDemoData(): Promise<{ file: Buffer; protocol: Buffer }> {
  const { loaded, ctx } = await demoRun(createTestContext());
  const period = { from: '2026-09-01', to: '2026-09-30' } as const;
  const [outcome] = await runExport({ period, propertyIds: [DEMO_PROPERTY], dryRun: false, overwrite: false }, { loaded, source: createSource(loaded, ctx), ctx });
  expect(outcome?.status).toBe('written');
  // Until a06 brings Swiss demo data, the demo mapping books 10 and 20 % with the placeholder codes V10 and V20.
  expect(outcome?.findings.map((f) => [f.code, f.value])).toEqual([
    ['W-MWST-CODE-UNCHECKED', 'V10'],
    ['W-MWST-CODE-UNCHECKED', 'V20'],
  ]);
  const folder = join(ctx.cwd, 'demo-output', DEMO_PROPERTY, '2026-09');
  return { file: readFileSync(join(folder, FILE)), protocol: readFileSync(join(folder, PROTOCOL)) };
}

describe('docs/examples', () => {
  it('Treuhänder reviews before setup: holds the ABACUS_Buchungen file and the protocol a real export of the demo data writes', async () => {
    const { file, protocol } = await exportDemoData();
    if (UPDATE) {
      writeFileSync(root(`docs/examples/${FILE}`), file);
      writeFileSync(root(`docs/examples/${PROTOCOL}`), protocol);
    }
    const difference = describeDifference(read(`docs/examples/${FILE}`), file);
    expect(difference, `docs/examples/${FILE} differs from the current output:\n${difference}`).toBeUndefined();
    expect(read(`docs/examples/${PROTOCOL}`).toString('utf8')).toBe(protocol.toString('utf8'));
    expect(protocol.toString('utf8')).not.toMatch(/^DEMO/m);
    expect(protocol.toString('utf8')).toContain('Import into Abacus FIBU');
    expect(file.toString('utf8')).not.toContain('DEMO');
  });

  it('holds the Abacus mapping of the demo: Kurtaxe on 2210 without MWST-Code, Kostenstelle 20 on the drinks, and no mapping error', () => {
    const mapping = read('docs/examples/mapping-BSP.example.csv');
    expect(mapping.equals(read('examples/demo/mapping-BSP.csv'))).toBe(true);
    const text = mapping.toString('utf8');
    expect(text).toContain('apaleo_account;apaleo_type;apaleo_name;apaleo_vat_percent;abacus_account;mwst_code;mwst_percent;kost;comment');
    expect(text).toMatch(/^3501;CityTaxes;.*;2210;;;;.*Kurtaxe als durchlaufender Posten/m);
    expect(text).toMatch(/^RevenueFoodAndBeverages_Normal:20\.00;Revenues;.*;3100;V20;20;20;/m);
    const findings = checkMapping(parseMapping(mapping, { path: 'mapping-BSP.example.csv' }));
    expect(findings.filter((f) => f.code.startsWith('E-'))).toEqual([]);
  });
});

describe('examples/demo', () => {
  it('holds exact copies of the Hotel Beispiel apaleo fixtures, plus the demo-only days', () => {
    const recorded = filesIn('examples/demo/apaleo');
    const fixtures = filesIn('test/fixtures/apaleo').filter((file) => file.endsWith('.json') && !file.includes('swagger') && !file.startsWith('live/') && !file.startsWith('ch-month/'));
    expect(recorded).toEqual([...fixtures, ...DEMO_ONLY_DAYS].sort());
    for (const file of fixtures) {
      expect(read(`examples/demo/apaleo/${file}`).equals(read(`test/fixtures/apaleo/${file}`)), file).toBe(true);
    }
  });
});
