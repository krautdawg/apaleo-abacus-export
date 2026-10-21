## Context

a03 switched mapping, posting, pipeline and checks to Abacus; the BMD writer, its target, the EKR template and the BMD docs remain in the tree but are unused. The BMD project removed DATEV the same way (b04), which kept the engine switch and the deletion reviewable separately.

## Goals / Non-Goals

**Goals:**
- Delete every BMD-only file, code path, finding code and doc, and prove that the Abacus output does not change.
- Leave the repository with exactly one target, one template and one set of guides.

**Non-Goals:**
- Content rewrites of README and guides (a08); new Swiss rules (a05).

## Decisions

1. **Delete, do not archive in-tree.** apaleo-bmd-export stays the public home of the BMD writer; keeping a copy here would double maintenance and confuse the docs test. Contributors who want BMD next to Abacus use the documented `TargetWriter` boundary.
2. **Keep the refusals of old inputs.** The `bmd` and `datev` config sections and BMD and DATEV mapping files and the account export of a paid connector stay refused with a helpful message (a03 rules); these messages are the only places where "BMD" or "DATEV" remain in `src/`, and none names a connector vendor.
3. **Rename the sign-off heading now.** `## Checkliste zur Freigabe durch den Treuhänder` replaces the Kanzlei heading together with the test that checks it, because the mapping guide is already Swiss after a03 and the docs-folder requirement is rewritten here.
4. **Remove the Austrian research note.** `openspec/research/bmd-target.md` described the BMD target; `a-target.md` is the research note of this product. The BMD note stays available in apaleo-bmd-export.

## Risks / Trade-offs

- [A helper used by both writers is deleted] → task 1.5 runs the full suite without `UPDATE_GOLDEN`; any Abacus golden change fails the slice.
- [A doc still links a deleted file] → the docs test's link check fails on every dead relative link.

## Open Questions

None.
