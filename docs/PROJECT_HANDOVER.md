# PocketPal Lite — Project Handover

> **Last updated:** 2026-11-05  
> **Repository:** [MasamuneKN/pocketpal-light](https://github.com/MasamuneKN/pocketpal-light)  
> **Default branch:** `main`  
> **Related branch:** `refactor/remove-unreachable-features`  
> **Project status:** Active development. Latest CI status and device verification are not confirmed by this document.

This document is the durable project context for future contributors and ChatGPT sessions. Keep it updated after meaningful milestones. The Git repository is authoritative for code; verify live branch state, source files, and CI before making changes.

## 1. Project goal

Build **PocketPal Lite**, a lean Android-focused edition of PocketPal AI that retains a dependable on-device assistant experience while removing functionality outside the agreed Lite scope. Prioritize local inference, reliable model downloads and storage, persistent local data, gallery-based image selection, and reproducible Android builds.

## 2. Confirmed product decisions

- **Feature scope:** local/offline functionality.
- **Platform:** Android only. Do not spend time on iOS builds unless the user changes this decision.
- **Images:** gallery selection only; no camera capture workflow.
- **Typography:** compact.
- **Development branch:** `main` is the intended branch.
- Keep the app lean and avoid reintroducing removed online/cloud-dependent functionality.

## 3. Required retained functionality

1. Run supported language models locally on the Android device.
2. Download/import models and store them reliably on-device.
3. Preserve model and app/chat state across app restarts.
4. Select images from the device gallery; do not require camera capture.
5. Use compact typography and a focused UI.
6. Provide reliable automated checks and a reproducible Android build.
7. Verify that downloaded models can be used offline.

## 4. Repository and toolchain facts observed (2026-11-05)

- Repository: `MasamuneKN/pocketpal-light`
- Public repository; connected GitHub account had admin/push permissions when inspected.
- Default branch: `main`.
- Branches observed: `main`, `refactor/remove-unreachable-features`.
- Package manifest snapshot:
  - React Native `0.87.1`
  - React `19.2.3`
  - TypeScript `5.9.3`
  - Yarn `1.22.22` (Classic)
  - Node engine `>=22.21.0`
  - `yarn test` invokes Jest.
  - `yarn typecheck` invokes `tsc --noEmit`.
  - `yarn lint` invokes `eslint .`.
  - `yarn build:android` invokes `cd android && ./gradlew assembleProdDebug && cd ..`.
- The fetched README on `main` describes the broader upstream PocketPal product, not the agreed Lite scope.
- The package manifest still listed dependencies and scripts associated with broader features at inspection time. Their presence does not prove they are reachable or required; audit actual imports, native configuration, build variants, and transitive dependencies before removal.

## 5. Recent commits observed

Recent commit search results included:

- `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf` — `chore(lite): remove tests for retired search and voice features`
- `a2792487156d8b263bafc25e45764f748aedd74f` — same commit message
- `98abd46fc22614b495c61baeceb39ba2629dc781` — remove stale search sheet barrel
- `7714f87e4a679d5cd8bb4d3d11d644ea7eeede18` — remove unused search provider key sheet
- `21330b67ad94002a8a522bbd323fa75e2909ac6b` — remove obsolete video pal screen
- `24e37386558d8759b8a11e8bc1b10ccfbd80a4ef` — remove unused search key sheet export
- `353d6511e9f69271093b413e9637634bea747cd0` — apply repository Prettier formatting
- `4f75577d1df99f217b44965947e0e342cf970421` — remove obsolete server details callback
- `17e723a05beeb3ca582c360395762c6f5eb328e5` — correct reasoning capability defaults
- `27e3e98060bdfd1ffdb473dbca0332b0c14a0df2` — remove stale remote URL allowlist hook

These are observed search results, not a complete history. Their branch membership and ancestry were not established in that inspection. Verify current `HEAD` SHAs and branch history before relying on this list.

## 6. User-reported build/test history

The user reported repeated CI and Android build failures in earlier development sessions, including runs where only one workflow passed and later runs failed again. In an earlier repository state, the user also reported testing a fresh build on-device and finding it functional.

**Do not treat that earlier device test as proof that the current refactor works.** The latest workflow run status, exact current failure logs, and current device-test status were not verified when this document was written.

## 7. Prioritized work plan

### P0 — Establish actual repository state

- Fetch current `main` and `refactor/remove-unreachable-features` HEAD SHAs.
- Compare commit ancestry and file trees; establish which branch contains intended changes.
- Inspect the latest GitHub Actions runs and failing job logs.
- Check for duplicate commits, missing commits, uncommitted work, or branch divergence.
- Do not force-push, rewrite history, or discard working code without explicit authorization.

### P1 — Fix tests without hiding regressions

- Run the full Jest suite and capture exact failing test names, stack traces, and exit codes.
- Distinguish tests for deliberately retired functionality from tests covering retained behavior.
- Remove tests only when the feature is explicitly out of scope and corresponding production code is also retired.
- Do not broadly skip suites, weaken assertions, suppress exceptions, or modify tests solely to make CI green.
- Preserve/add regression coverage for local inference, model downloads, persistence, and gallery selection.

### P2 — Remove unreachable functionality safely

- Retire Plus/purchases, voice input/output, Pals, and related UI/services where they are outside the agreed Lite scope.
- Trace navigation registrations, imports, exports, feature flags, native Android configuration, resources, tests, and dependencies.
- Check shared modules carefully before deletion.
- Preserve gallery image selection; remove camera-capture paths and unnecessary camera permissions.
- Remove dead routes, dangling imports, unused assets, and obsolete configuration.

### P3 — Dependency and lockfile audit

- Map dependencies to JS/TS imports, native Gradle configuration, scripts, codegen, and runtime use.
- Remove only dependencies proven unnecessary after feature retirement.
- Regenerate `yarn.lock` using the declared Yarn Classic version (`1.22.22`) and supported Node version in a clean environment.
- Never hand-edit the lockfile.
- Verify with `yarn install --frozen-lockfile` after regeneration and inspect the diff for unexpected version churn.
- Preserve React Native and native-module compatibility.

### P4 — Android build and device verification

Run relevant checks (at minimum lint, typecheck, Jest, and Android build) and record exact commands and results. Inspect Gradle product flavors/tasks before choosing the build variant.

On a real Android device, verify:

1. App installs and launches.
2. A model can be downloaded or imported.
3. Downloaded model remains available after app restart.
4. Model loads and generates output locally.
5. Chat/app state persists across restart.
6. Gallery image selection works.
7. Camera capture is not required and unnecessary camera permission is absent.
8. After model download, core inference works with network disabled.

Record artifact path, checksum, workflow URL, commit SHA, and device-test evidence. Report a check as passed only when logs or direct evidence support that claim.

## 8. Working constraints and preferences

- The user primarily works from a phone and may use UserLAnd; prefer GitHub Actions and phone-friendly instructions where practical.
- The user values root-cause fixes and evidence, not superficial green builds.
- Avoid unnecessary iOS work.
- Make small, logically grouped commits with clear conventional commit messages.
- Run focused tests after each meaningful change and the full verification set at integration points.
- Report exact files changed, commit SHA, workflow URL, failure cause, and verification evidence.
- Never claim a build, test, or device check passed without confirming it.
- Never request that the user paste access tokens, signing keys, keystores, or passwords into chat.

## 9. Next-session startup checklist

1. Read this handover document.
2. Connect to `MasamuneKN/pocketpal-light` using the authorized GitHub integration.
3. Fetch both branch HEAD SHAs and compare their histories and trees.
4. Inspect the latest GitHub Actions runs and logs.
5. Produce a short status report separating verified facts, unknowns, and proposed actions.
6. Continue the prioritized plan above without changing the agreed Lite scope.

## 10. Document maintenance

Update this file after each major milestone. Include:

- Date and commit SHA.
- Summary of implementation changes.
- Tests/builds run, exact outcomes, and workflow links.
- Device verification performed (or explicitly not performed).
- Remaining blockers and next actions.

Keep historical notes factual. When a previous status becomes stale, replace it with the newly verified state rather than silently carrying forward old assumptions.

## 11. Verified status review — 2026-11-05

- Current `main` HEAD observed: `6067fe12e8cf267c779780d9b60a8efe4288d019` (handover-document commit).
- The related `refactor/remove-unreachable-features` branch still exists.
- GitHub compare reports the feature branch as diverged from `main`: 7 commits ahead and 1 behind, with merge base `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`. Do not merge or reset either branch without inspecting the full commit sequence and resolving the divergence deliberately.
- No open pull requests or open issues were returned by repository-scoped GitHub searches during this review.
- The current `package.json` on `main` still contains iOS scripts and packages associated by name with voice, purchases, camera, Firebase, and Supabase. This is evidence that dependency/scope cleanup is not complete; determine actual reachability and native usage before removing anything.
- `yarn.lock` exists and is a Yarn v1 lockfile. Its presence alone does not verify a clean Yarn 1.22.22 install or lockfile consistency.
- CI could not be conclusively verified in this review. The available commit-workflow lookup returned no PR-triggered runs for the prior code commit, and combined commit-status lookups returned no status entries. These empty results are not proof that no Actions runs exist or that CI passed. Inspect the repository Actions page/run logs through a workflow-runs listing capability before reporting CI status.
- No current Jest, lint, typecheck, Android build, or physical-device verification was performed in this review.

### Next actions from this review

1. Inspect the 7 feature-branch-only commits and the one main-only commit, then decide how to integrate without losing either side's work.
2. Obtain the actual latest Actions run list and inspect failed job logs; do not infer status from empty commit-status responses.
3. Continue the dependency/native configuration audit, retaining local inference, model downloads, persistence, and gallery selection while removing only proven-unreachable features.

## 12. Verified session review — 2026-11-05 (latest live repository state)

### Branch state and history

- Live `main` HEAD: `68e2e2ba11c8a7466300a983e70eab6baddd5cc7` — `fix(model-store): resolve active remote models`.
- Live `refactor/remove-unreachable-features` HEAD: `69400451b2036ee1066a68cae37d186ce8e3d0d8` — `fix(test): format model store mock for Prettier`.
- GitHub compare `main...refactor/remove-unreachable-features`: **diverged**, feature branch 7 commits ahead and 12 commits behind; merge base `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`.
- The 7 feature-branch commits are the two retired-search/voice test cleanup commits, obsolete search barrel removal, two model/download mock updates, and Plus-gate cleanup attempts. The current feature-branch diff against main touches `__mocks__/services/downloads.ts`, `__mocks__/stores/modelStore.ts`, `android/app/build.gradle`, and `scripts/verify-plus-gate.sh`. Do not merge, reset, or cherry-pick wholesale: main has 12 later commits, including Jest setup/config fixes and model/server-store fixes.
- Main's 12 commits since the merge base change the two shared mocks, Jest config/setup, `ModelStore.ts`, `ServerStore.ts`, and add this handover. No source changes were made in this review.

### Latest GitHub Actions evidence

- Latest listed run at review time: [CI Pipeline #156](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42062516024), run ID `42062516024`, on main SHA `68e2e2ba11c8a7466300a983e70eab6baddd5cc7`, completed **failure**.
- Job `build-and-test` failed at **Run unit tests**. The preceding install, localization validation, font validation, ESLint, and TypeScript typecheck steps all completed successfully. Test output: **61 failed / 428 suites; 407 failed / 8,669 tests; 2 skipped; 8,260 passed; 310 snapshots passed**.
- Failure logs show broad failures across retained and retired areas, including ModelStore/ServerStore, chat/model screens and components, navigation/header tests, script tests, Pals/Plus/voice-related tests, and system-prompt talent tests. Example stale test assumption: `HeaderLeft.test.tsx` calls a mocked `useFocusEffect` even though current `HeaderLeft.tsx` no longer imports or invokes it. This is a confirmed mismatch in that test, not an explanation for all 407 failures. Do not bulk-delete tests or weaken assertions; inspect failures by root cause and retain coverage for local inference, downloads, persistence, and gallery selection.
- Latest listed Android run: [Build PocketPal Android APK #144](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42062521516), run ID `42062521516`, same main SHA, completed **success**. All 16 build-job steps passed, including Android SDK setup, Yarn frozen-lockfile install, optimized `assembleProdRelease`, diagnostics upload, and APK upload.
- APK artifact `PocketPal-Android-APK`: 70,991,592 bytes; artifact archive digest `sha256:54d86e13d5a7aff02c610800c923331d74346930e8323c35b381b671ec9f5637`. This is the GitHub artifact archive digest, **not** a verified APK file checksum. Artifact expires 2026-11-12. Build diagnostics artifact digest: `sha256:85fd83edc95a5fc1f2cdd41ee1c5a9b7d45790f40e6aaf97945b38308679eb85`.
- The CI workflow currently has an Android build job dependent on the test job, so the Android job was skipped in failed CI run #156. The separate Android APK workflow succeeded. iOS CI job is explicitly disabled with `if: false`.

### Source/configuration observations

- Current `package.json` still includes iOS scripts and dependencies named for voice/speech, IAP, camera, Firebase, Supabase, and other broad PocketPal features. Names alone do not establish reachability; perform an import/native/codegen audit before removing dependencies.
- Current Android manifest does not declare camera permissions and uses no camera capture activity/service. It retains INTERNET for model downloads and older-device external-storage permissions (max SDK 28) for legacy session storage.
- Current `android/app/build.gradle` still wires the Plus-gate environment input into Hermes bundle task inputs. The Android release workflow also still runs `scripts/verify-plus-gate.sh`; deleting that verifier before updating the workflow will break the build pipeline. Coordinate feature retirement and workflow cleanup.
- Android product flavors/build types currently constrain valid variants to prodDebug, prodRelease, e2eDebug, and e2eReleaseE2e. The successful workflow built prodRelease; the separate package script still points to assembleProdDebug.

### Verification boundaries and next actions

- Verified in GitHub Actions: lint, typecheck, localization/font checks, Yarn install, and Android prodRelease build passed on SHA `68e2e2ba11c8a7466300a983e70eab6baddd5cc7`; Jest failed as detailed above.
- Not verified in this session: local clean install, full test reproduction, APK extraction/checksum, physical-device install/launch, model download/restart/inference, persistence, gallery flow, or offline inference.
- No code, dependency, or lockfile changes were made. `yarn.lock` was not regenerated.
- Next: obtain a focused failure inventory from CI logs; group the 407 failures by shared mock/setup drift versus real retained-feature regressions versus explicitly retired-feature tests. Inspect and repair the model/download mock and ModelStore/ServerStore failures first. Then reconcile the 7 branch-only commits against the 12 main-only commits selectively, audit feature reachability and Android build/workflow coupling, and only then remove obsolete packages and regenerate the lockfile with Yarn 1.22.22.

## 13. Verified session update — 2026-11-06

### Live repository and branch state

- Latest main commit created during this session: de4638c2861921a006adb5817305799369820ff8 — test(model-store): mark active model fixture as available.
- Before this commit, GitHub compare reported main at f4d4e314b7c5f088471e24b35a8b620a156a851e, with refactor/remove-unreachable-features 7 commits ahead and 14 behind; merge base ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf. Refresh the comparison after this main-branch commit before any integration decision.
- Both branches still exist. No merge, reset, force-push, or feature-branch rewrite was performed.

### CI results retrieved

- Previously pending CI Pipeline run #158 (run ID 42079174054) completed failure. Install, localization validation, font validation, ESLint, and TypeScript checks passed; Jest failed. Summary: 61 failed / 428 suites; 407 failed / 8,669 tests; 2 skipped; 8,260 passed; 310 snapshots passed. The dependent Android job was skipped.
- Previously pending Android APK run #146 (run ID 42079178109) completed success. All 12 build steps passed, including optimized release APK build and artifact upload.
- Run URLs: https://github.com/MasamuneKN/pocketpal-light/actions/runs/42079174054 and https://github.com/MasamuneKN/pocketpal-light/actions/runs/42079178109.
- These are the latest specific run IDs retrieved from the preceding session. A repository-wide latest-run listing was not available through the connected GitHub actions in this session; do not claim no newer runs exist.

### Test correction committed

- Inspected src/store/ModelStore.ts: activeModel resolves through availableModels, which deliberately includes only local/imported or downloaded models plus remote models.
- The failing should return correct active model test used presetModelFixture with isDownloaded false, isLocal false, and preset origin. The fixture therefore represented a model excluded by the production availability contract.
- Corrected only the test setup to use {...presetModelFixture, isDownloaded: true}, retaining the original assertion. This aligns the test fixture with the behavior being tested; no production behavior or assertion was weakened.
- Commit: de4638c2861921a006adb5817305799369820ff8.
- GitHub commit fetch confirmed the exact one-file diff and the updated test content on main.
- The focused Jest test and full suite have not yet been rerun. This change is committed but not yet verified by CI.

### Outstanding work

1. Re-fetch current main and feature-branch heads; refresh compare counts after the test correction commit.
2. Retrieve the CI run triggered by de4638c2861921a006adb5817305799369820ff8 when available and inspect its focused test outcome.
3. Continue classifying ModelStore/ServerStore failures; do not assume the single fixture correction resolves the rest of the 407 failures.
4. Audit feature-branch commits and reconcile selectively.
5. Remove unreachable Plus, voice, and Pals paths only after tracing shared code, native configuration, workflows, and tests.
6. Audit dependencies and regenerate yarn.lock using Yarn 1.22.22; no dependency or lockfile changes have been made.
7. Physical-device verification remains outstanding: model download, restart persistence, local inference, gallery selection, and offline inference.

No local Jest, lint, typecheck, or Android build was run in this session. The Android success above is GitHub Actions evidence only; no new device verification was performed.

## 14. Verified session update — 2026-11-06 (continued)

### Current branch state

- Current `main` HEAD before this handover update: `66fae0c549a301d32c76ef0aa175d321b169098d` — `test(chat-header): use an available model fixture`.
- `refactor/remove-unreachable-features` remains at `69400451b2036ee1066a68cae37d186ce8e3d0d8`.
- Fresh GitHub compare: branches remain diverged; feature branch is 7 commits ahead and 17 commits behind. Merge base remains `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`.
- Current feature-only diff still touches `__mocks__/services/downloads.ts`, `__mocks__/stores/modelStore.ts`, `android/app/build.gradle`, and `scripts/verify-plus-gate.sh`. No branch integration or history rewrite was performed.

### Latest Actions evidence

- Latest CI Pipeline before the new test correction: [run #162](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42089860075), run ID `42089860075`, on SHA `8d81e309de3dd73d6080af1f322de8ce1d943f39`, completed **failure**.
- CI install, localization validation, font validation, ESLint, and TypeScript checks passed. Jest failed: **61 failed / 428 suites; 406 failed / 8,669 tests; 2 skipped; 8,261 passed; 310 snapshots passed**. The dependent CI Android job was skipped.
- The latest listed standalone Android workflow before the new correction was [run #150](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42089863742), on SHA `8d81e309de3dd73d6080af1f322de8ce1d943f39`, completed **success**. This verifies the workflow build, not device behavior.
- New runs triggered by the latest test correction are queued at review time: [CI #163](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42105701731), [format/validate #36](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42105701738), and [Android APK #151](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42105701814). Their outcomes are **not yet verified**.

### New test correction

- Inspected `ChatHeaderTitle.tsx`: it renders `modelStore.activeModel`, which follows the store's availability contract.
- The component tests used `basicModel` with `isDownloaded: false` and `isLocal: false`, so the fixture was not an available model. This reproduces the same fixture-contract mistake identified in the earlier ModelStore test.
- Updated only `src/components/ChatHeaderTitle/__tests__/ChatHeaderTitle.test.tsx` to create an available basic-model fixture with `isDownloaded: true`; original title/model assertions remain intact.
- Commit: `66fae0c549a301d32c76ef0aa175d321b169098d`. GitHub fetch confirmed the committed file content.
- This is a targeted test-fixture correction, not proof the test passes. The CI run triggered by it is still queued; no local Jest execution was performed.

### Remaining failure clusters observed in CI #162

- ModelStore and ServerStore suites.
- Chat/session, ChatScreen, ChatInput, SettingsScreen, model UI, and download UI suites.
- Pals/Plus/voice suites that require removal only in coordination with their production paths.
- Talent/system-prompt registry expectations; current talent registration shown in `src/services/talents/index.ts` registers RenderHtml, Calculate, and Datetime engines, while the failing test still expects `web_search`.
- HeaderLeft tests still exercise Plus return-focus behavior although current `HeaderLeft.tsx` no longer imports or uses the focus hook. This is stale Plus-related test coverage, but should be removed only as part of the coordinated Plus retirement.
- Server-default and ChatHeaderTitle component tests also contain fixture/expectation drift. Inspect each failure against production behavior before changing it.

### Verification boundaries

- No local lint, typecheck, Jest, Yarn install, or Android build was run in this continuation.
- No dependencies or lockfile were changed; `yarn.lock` was not regenerated.
- No physical-device tests were performed. Model download, persistence across restart, local inference, gallery selection, and offline inference remain unverified.
- No production source code was changed in this continuation; only the ChatHeaderTitle test fixture was updated.
- Next: inspect outcomes of CI #163 / Android #151; use the new Jest report to classify failures by retained-feature regression, invalid test fixture, or intentionally retired functionality. Continue ModelStore/ServerStore repair first, then coordinate Plus/voice/Pals removal and dependency audit.

## 15. Verified session update — 2026-11-06 (repository refresh and test-fixture corrections)

### Live repository and branch state

- Live `main` HEAD at the start of this work: `48b503f4424ef585058d56bd520f0f9121761002` (`chore: apply repository Prettier formatting`). Current session commits: `0696880fafa617fb47c0bf700be72f9508462058` and `f7a89f4d401510fd34c887d8608ab7ff237f3994`.
- `refactor/remove-unreachable-features` remains at `69400451b2036ee1066a68cae37d186ce8e3d0d8`.
- Fresh compare after the two commits: branches diverged; feature branch is 7 commits ahead and 21 behind. Merge base remains `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`. No merge, cherry-pick, reset, force-push, or branch rewrite was performed.
- The visible feature-branch Gradle difference removes the `PLUS_STORE_GATE` Hermes task input. The verifier script remains present; do not integrate the Gradle change in isolation until the gate's workflow/build contract is retired together. The feature branch's remaining mock changes were not adopted in this session.

### Latest Actions evidence before the final test commit

- [CI Pipeline #166](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42106049889), on `48b503f4424ef585058d56bd520f0f9121761002`, completed failure: ESLint and TypeScript passed; Jest failed with 406 failed / 8,669 tests, 2 skipped, 8,261 passed, across 61 failed / 428 suites. The CI Android job was skipped.
- [Android APK #154](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42106053906), on the same SHA, completed success. All 12 steps passed, including optimized release APK build and artifact upload.
- Failure-log inspection confirmed one ModelStore remote-vision test supplied a remote model through the persisted local-model array instead of `ServerStore.userSelectedModels`; one ServerStore test expected a model-list fetch from `afterHydration()` even though that method only normalizes hydrated server types; and one ChatGenerationSettingsSheet test constructed a remote model without registering its server/selected-model relationship.

### Test corrections committed

- `0696880fafa617fb47c0bf700be72f9508462058` — `test(stores): align remote model fixtures with store contract`.
  - `src/store/__tests__/ModelStore.test.ts`: remote vision fixture now registers the remote model through `serverStore.userSelectedModels` and clears that state after the test. This matches `ModelStore.remoteModels` and `activeModel` resolution.
  - `src/store/__tests__/ServerStore.test.ts`: the hydration test now explicitly calls `fetchModelsForServer('srv-1')` after `afterHydration()`, so it verifies the normalized type is seen by the first actual fetch rather than expecting hydration itself to fetch.
- `f7a89f4d401510fd34c887d8608ab7ff237f3994` — `test(chat-settings): configure selected remote server fixture`.
  - `src/components/ChatGenerationSettingsSheet/__tests__/ChatGenerationSettingsSheet.serverDefaults.test.tsx`: fixture now registers both the server and selected remote model, and restores the prior store state after each test.
- These are test-fixture/contract corrections only. Assertions were retained; no production behavior was changed. No local Jest execution was available, so these corrections are **not yet verified as passing**.

### Actions triggered by the latest code commit

- [CI Pipeline #169](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42118196023) on `f7a89f4d401510fd34c887d8608ab7ff237f3994` was in progress when this note was written. Its `build-and-test` job had started; the Jest outcome was not yet available.
- [Format and validate #39](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42118135272) was in progress.
- [Android APK #157](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42118199597) was in progress.
- Earlier runs #167/#168 and Android #155/#156 were superseded/cancelled while new commits were pushed; do not treat those as verification.

### Remaining work and next actions

1. Retrieve final outcomes and logs for CI #169, format/validate #39, and Android APK #157. Verify whether the three corrected test cases pass.
2. Continue classifying Jest failures by retained-feature regression, invalid test setup, and explicitly retired functionality. Do not bulk-delete tests or weaken assertions.
3. Continue tracing Plus, purchases, voice, and Pals from navigation through services, native configuration, tests, and workflows before deleting shared code.
4. Reconcile the feature branch selectively; it remains diverged and must not be merged wholesale.
5. Audit dependency reachability and regenerate `yarn.lock` with Yarn Classic 1.22.22 in a clean environment. No package or lockfile changes were made.
6. Physical-device checks remain outstanding: installation/launch, model download/import, persistence after restart, local inference, gallery selection, and offline inference.

No physical-device verification was performed. No production source, dependencies, or lockfile were changed in this session.

## 16. Verified session update — 2026-11-06 (CI rerun and formatting workflow)

### Latest repository state

- Live `main` HEAD before this note: `f1a84f92057c9a152f2f71755a4bd67a52133c29` — `chore: apply repository Prettier formatting`.
- This formatting commit changes only `src/components/ChatGenerationSettingsSheet/__tests__/ChatGenerationSettingsSheet.serverDefaults.test.tsx`, collapsing a multi-line array to the repository's Prettier form. The functional test fixture correction remains unchanged.
- Feature branch remains at `69400451b2036ee1066a68cae37d186ce8e3d0d8`; compare remains diverged, 7 ahead / 21 behind, merge base `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`.

### Formatting workflow incident and recovery

- [Format/validate #39](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42118135272) failed at its commit step, not during formatting or dependency installation. Prettier completed successfully; the runner's push was rejected with `[rejected] HEAD -> main (fetch first)` because the handover update had advanced `main` after that runner checked it out. No remote commit was overwritten and no force-push was attempted.
- [Format/validate #40](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42118350795) subsequently completed **successfully**. It committed the one-file formatting correction as `f1a84f92057c9a152f2f71755a4bd67a52133c29` and dispatched fresh validation.
- CI #169 was cancelled while the repository advanced. CI #170 is running against the handover commit `f7fc8ff950102fccd5750a2630133e63008a70d1`; CI #171 is queued against the current formatting commit `f1a84f92057c9a152f2f71755a4bd67a52133c29`.
- Android APK #159 is in progress against `f1a84f92057c9a152f2f71755a4bd67a52133c29`. Earlier APK runs #157 and #158 were cancelled while main advanced; do not count them as verification.

### Verification status

- The three targeted Jest test corrections from commits `0696880fafa617fb47c0bf700be72f9508462058` and `f7a89f4d401510fd34c887d8608ab7ff237f3994` have **not yet received a completed Jest result**. CI #169 was cancelled before its test outcome; CI #170 had not completed when this note was written, and #171 was queued.
- Format/validate #40 passed, including locked dependency installation and Prettier formatting.
- The last completed Android release evidence remains APK #154 success on the earlier code SHA `48b503f4424ef585058d56bd520f0f9121761002`. Current APK #159 remains in progress.
- No local lint, TypeScript, Jest, or Android build was run. No physical-device verification, dependency changes, or lockfile regeneration was performed.

### Next actions

1. Fetch the final outcomes and logs for CI #170/#171 and Android APK #159. Prefer the latest completed run on the current main SHA.
2. Confirm whether the ModelStore remote-vision fixture, ServerStore hydration/fetch test, and ChatGenerationSettingsSheet remote-server fixture now pass.
3. Continue failure triage from the remaining retained-feature regressions; coordinate Plus/voice/Pals test retirement with production and workflow cleanup.
4. Keep the feature branch untouched until its remaining Plus-gate Gradle difference is reviewed alongside the verifier/workflow contract.
5. Complete dependency reachability analysis and regenerate `yarn.lock` only with Yarn Classic 1.22.22 in a clean environment.
6. Physical-device verification remains outstanding for model download/import, persistence, local inference, gallery selection, and offline operation.

## 17. Verified session update — 2026-11-06 (Actions cost control and CI triage)

### Repository state and workflow changes

- Session started from main SHA `5ded275b9f605ac730e86dafaa332f0774ad1918` (`fix(lint): remove unused server defaults test import`). The unused `ModelOrigin` import was removed from `src/components/ChatGenerationSettingsSheet/__tests__/ChatGenerationSettingsSheet.serverDefaults.test.tsx`; GitHub fetch confirmed the updated source.
- Latest main SHA at the time of this note: `22396ee939e4721033f45a811a5ab29c2175a7d2`.
- Two workflow changes were committed:
  - `d66231859062b11533e66a15f7f21b0958a33c26` — `ci(android): make standalone APK builds manual-only`. `.github/workflows/build-android.yml` now runs only through `workflow_dispatch`, not on every push to main/local-only-android.
  - `22396ee939e4721033f45a811a5ab29c2175a7d2` — `ci: stop dispatching APK builds before CI passes`. `.github/workflows/format-and-validate.yml` now dispatches CI only; it no longer separately dispatches the standalone APK workflow.
- The normal CI workflow already defines `build-android` with `needs: [build-and-test, detect-changes]`. GitHub Actions therefore skips this Android job when lint/typecheck/Jest fail, and runs it only after the checks pass (except translation-only changes). This retains Android release validation on passing code while avoiding a separate APK build for a failing test run.
- The standalone optimized APK workflow remains available for an intentional manual build from the Actions tab or workflow dispatch. No build/test assertions were removed or weakened.

### Actions evidence

- [CI Pipeline #42158624501](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42158624501), SHA `5ded275b9f605ac730e86dafaa332f0774ad1918`, completed **failure**. ESLint and TypeScript passed; Jest failed: **60 failed / 428 suites; 403 failed / 8,669 tests; 2 skipped; 8,264 passed; 310 snapshots passed**. The dependent CI Android job was skipped.
- [Standalone Android APK #42158627128](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42158627128), same SHA, completed **success**. This demonstrates the old duplicate-build behavior: a separate APK workflow still built an APK even though Jest failed in CI. The workflow changes above remove that automatic duplicate path going forward.
- After workflow edits, new CI runs were created for SHAs `d66231859062b11533e66a15f7f21b0958a33c26` (run #42165212502) and `22396ee939e4721033f45a811a5ab29c2175a7d2` (run #42165216942); format/validate runs #42165212498 and #42165217094 were also pending/in progress at the last poll. Their final outcomes must be checked before claiming validation passed.
- The latest failure log still shows broad test drift: ModelsHeaderRight filter actions expected callbacks that were not called; language-sync could not parse `languageRegistry`; FABGroup tests expected a remote-model FAB; ChatHeader/ChatHeaderTitle and server-default UI expectations failed; talent tests expected retired `web_search` fragments; HeaderLeft tests still exercise the removed Plus focus-return path. These are separate failure clusters and must be checked against current production behavior before changing tests.
- The CI job summary and logs are the evidence for the Jest counts above. No new physical-device test was performed.

### Branch state

- `refactor/remove-unreachable-features` remains at `69400451b2036ee1066a68cae37d186ce8e3d0d8`.
- Fresh compare after the workflow commits: branches remain diverged, feature branch **7 commits ahead / 27 behind**, merge base `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`.
- Current feature-only diff remains limited to `__mocks__/services/downloads.ts`, `__mocks__/stores/modelStore.ts`, `android/app/build.gradle`, and `scripts/verify-plus-gate.sh`. No merge, cherry-pick, reset, force-push, or feature-branch rewrite was performed.

### Remaining work

1. Poll and inspect CI/format runs #42165212502, #42165216942, #42165212498, and #42165217094.
2. Continue Jest triage by shared root cause. Start with the retained local-model/download/store flows and fixture/setup drift; coordinate removal of Plus, voice, Pals, remote model-management UI, and related tests with actual production/navigation changes. Do not delete a failing test merely because it fails.
3. Inspect and selectively reconcile the seven feature-branch commits; do not merge the diverged branch wholesale.
4. Complete dependency reachability and native Android configuration audit. Do not regenerate `yarn.lock` until the removal set is established; use Yarn Classic 1.22.22 in a clean environment.
5. Verify Android APK only after passing CI, or on explicit manual dispatch. Keep physical-device checks outstanding until evidence is supplied: install/launch, model download/import, persistence, local inference, gallery selection, and offline inference.

## 18. Verified session update — 2026-11-06 (test-triage corrections and final workflow tuning)

### Changes committed after section 17

- `788d8ed87336e35527f1ff0a739a9635bc9435dd` — `fix(l10n): accept English-only locale registry`.
  - `scripts/lib/registry-languages.js` now treats an empty non-English locale list as valid; `null` remains reserved for a missing/malformed registry.
- `064c34878197f4750f48c2951f21a5435b86c875` — `test(l10n): align E2E locale fixtures with Lite scope`.
  - `e2e/specs/features/language.spec.ts` now declares only English, matching `src/locales/index.ts`.
- `3cab319859be245b16804a9329e541a4a02b02e3` — `test(models): align FAB coverage with Lite actions`.
  - Removed obsolete remote-FAB expectations; the production FAB exposes only Hugging Face and local-model actions.
- `d2068027f7071db989ba27bf652e4f6cb2cef63b` — `test(navigation): remove obsolete Plus focus coverage`.
  - Removed HeaderLeft test cases for the retired Plus return-focus behavior; retained the drawer-opening test.
- `46e644bd22314bb6ce7873b5e068131f07dc4108` — `testability(models): expose stable filter item test IDs`.
  - Added stable IDs to the HF/downloaded/grouped filter menu items.
- `74c82f76891ea66afdd13917668a9f2de6fffc9c` — `test(models): target filter menu actions by test ID`.
  - Updated the filter tests to press the actual menu items by test ID rather than dispatching press events against their text children.
- `17ea8069a2c28e6a8e824324bf8e43ffe80d2754` — `ci: avoid duplicate validation when formatting is unchanged`.
  - The format workflow dispatches CI only when it actually creates a bot formatting commit. Ordinary pushes already trigger CI directly.
- `9c1e00a71be697f03cc56331b91b214fb73f0183` — `chore: apply repository Prettier formatting`, generated by Format/validate #42165442990, which completed successfully.

### Latest validation state

- Latest CI Pipeline: [run #42165553255](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42165553255), SHA `9c1e00a71be697f03cc56331b91b214fb73f0183`. It was **in progress** at the time of this update. Do not infer the Jest outcome or Android job result until the run completes.
- Earlier CI attempts for intermediate SHAs were cancelled as newer commits arrived; they are not verification.
- One standalone Android build, [run #42165330082](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42165330082), was still **in progress** on SHA `064c34878197f4750f48c2951f21a5435b86c875`. It was dispatched by an already-running copy of the old format workflow before the dispatch was removed. It is a stale in-flight run, not evidence that the new workflow still triggers APK builds on pushes.
- The standalone APK workflow was verified on main to have only `workflow_dispatch`. The normal CI Android job still has `needs: [build-and-test, detect-changes]`, so it is skipped when the required checks fail.
- No local lint, typecheck, Jest, or Android build was run. The test corrections above remain **unverified until CI completes**.

### Current branch state

- Live main HEAD at this update: `9c1e00a71be697f03cc56331b91b214fb73f0183`.
- `refactor/remove-unreachable-features` remains at `69400451b2036ee1066a68cae37d186ce8e3d0d8`.
- Fresh compare: diverged; feature branch **7 commits ahead / 36 behind**; merge base remains `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`.
- Feature-only diff remains `__mocks__/services/downloads.ts`, `__mocks__/stores/modelStore.ts`, `android/app/build.gradle`, and `scripts/verify-plus-gate.sh`. No branch integration or history rewrite was performed.

### Next actions

1. Poll CI #42165553255 and inspect the final Jest summary and any failing test logs.
2. The server-default sheet test still appears structurally inconsistent: it sets a remote binding but does not create an active chat session, while the component intentionally supplies `serverDefaults` only when a session exists. Correct the fixture to create/restore a session, then verify the test rather than weakening its assertion.
3. Revisit the remaining ChatHeaderTitle and ChatHeader failures against the current store/component contracts.
4. Continue Plus/voice/Pals production retirement, dependency reachability audit, selective feature-branch reconciliation, Yarn Classic lockfile regeneration, and Android device verification.
5. The old automatic APK dispatch path is removed. Use manual dispatch for standalone APK packaging; normal CI builds Android only after successful checks.

## 19. Verified session update — 2026-11-06 (lint recovery and server-default fixture)

### Latest CI failure and correction

- [CI Pipeline #42165553255](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42165553255), SHA `9c1e00a71be697f03cc56331b91b214fb73f0183`, completed **failure at ESLint**, before TypeScript or Jest ran.
- Exact lint errors were two unused `getByText` destructurings in `src/components/ModelsHeaderRight/__tests__/ModelsHeaderRight.test.tsx` (lines 36 and 52). There were 51 additional warnings, but they were not fatal.
- Commit `980f1fc22d4c2619b7dbd6486e0bb9638c0560dd` — `fix(lint): remove unused menu test queries` — removes the two unused bindings. This commit's CI run #42165757436 was still in progress at the time of this update; its lint result is not yet confirmed.
- A separate review of the earlier server-default test failure showed that `ChatGenerationSettingsSheet` intentionally passes `serverDefaults` only when an active session exists. The test configured a remote binding but no active session, so it was exercising preset settings while expecting session-specific server defaults.
- Commit `d5f5aaddc379254faedc3f085df4e68cf3c95e96` — `test(chat-settings): provide active session for server defaults` — now creates a session in the fixture and restores the previous sessions and active-session ID in `afterEach`. This is a fixture correction; the test assertion is unchanged.

### Latest verification and branch state

- Latest main SHA: `d5f5aaddc379254faedc3f085df4e68cf3c95e96`.
- [CI Pipeline #42165757436](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42165757436) on `980f1fc22d4c2619b7dbd6486e0bb9638c0560dd` was **in progress** at this update.
- [CI Pipeline #42165765676](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42165765676) on current main SHA `d5f5aaddc379254faedc3f085df4e68cf3c95e96` was **queued**. Its result is the next verification target.
- [Format/validate #42165757396](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42165757396) on `980f1fc22d4c2619b7dbd6486e0bb9638c0560dd` was **in progress**; [Format/validate #42165765704](https://github.com/MasamuneKN/pocketpal-light/actions/runs/42165765704) on current main was **queued**.
- The earlier CI failure skipped TypeScript and Jest; do not report those checks as passed or failed from that run.
- Fresh branch compare: `refactor/remove-unreachable-features` remains diverged, **7 commits ahead / 39 behind**, merge base `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`. Feature-only diff remains the two mocks, `android/app/build.gradle`, and `scripts/verify-plus-gate.sh`. No merge or history rewrite was performed.

### Next actions

1. Poll the current-main CI #42165765676 and the associated formatting workflow. Confirm lint, typecheck, and Jest separately.
2. If Jest runs, inspect the new failure count and confirm the English-only locale, two-action FAB, HeaderLeft, ModelsHeaderRight, and server-default tests individually.
3. Continue remaining retained-feature test triage and the coordinated Plus/voice/Pals retirement.
4. Continue dependency/native reachability audit, selective feature-branch reconciliation, lockfile regeneration, and Android device verification.

## 20. Verified session update — 2026-11-06 (Actions cost control review)

### Live repository state

- Latest main HEAD verified: `89912bb79bdbf014067166edc4dc8077e6a6416e` — `chore: apply repository Prettier formatting`.
- `refactor/remove-unreachable-features` still exists. GitHub compare reports branches diverged: feature branch **7 commits ahead / 41 behind**; merge base `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`. The current feature-only diff is limited to `__mocks__/services/downloads.ts`, `__mocks__/stores/modelStore.ts`, `android/app/build.gradle`, and `scripts/verify-plus-gate.sh`. No branch changes or integration were performed.
- The compare endpoint identifies current main as `89912bb79bdbf014067166edc4dc8077e6a6416e`. A commit-workflow lookup for this SHA returned no PR-triggered workflow runs; this endpoint is not a repository-wide Actions run listing, so current CI outcome remains unverified.

### Android build cost-control verification

- Fetched `.github/workflows/build-android.yml` from main. Its only trigger is `workflow_dispatch`; standalone optimized APK packaging is manual-only. It installs with Yarn Classic 1.22.22 and runs `assembleProdRelease`.
- Fetched `.github/workflows/ci.yml`. The normal `build-android` job declares `needs: [build-and-test, detect-changes]`. GitHub Actions' default success condition means the job is skipped if lint/typecheck/Jest in `build-and-test` fails. It also skips translation-only changes. Thus an APK is not built after a failed required validation job; Android release validation still runs after successful checks for non-translation changes.
- The separate APK workflow is not automatically dispatched by the format workflow. No workflow edits were needed in this review; the current configuration already implements the requested cost control. Manual dispatch remains available when an APK is actually needed.
- Important distinction: the CI Android job is a release-build verification job, while the manual workflow packages/uploads a standalone APK. Neither should be described as a device test.

### Verification boundaries and next actions

- No new workflow result or failing-job log was available from the commit-scoped lookup for current main. Do not claim current lint, typecheck, Jest, or Android job outcomes until a repository-wide run result is retrieved.
- No production code, tests, dependencies, or lockfile were changed in this review. No local commands or physical-device tests were run.
- Continue with latest Actions run/job inspection when available; then prioritize retained-feature Jest failures, followed by coordinated Plus/purchases/voice/Pals removal, dependency/native reachability audit, and Yarn 1.22.22 lockfile regeneration.
- Reconcile the diverged feature branch selectively only after inspecting the exact seven commits and their current patches. Keep model download/import, local inference, persistence, gallery selection, and offline behavior covered.
- Physical-device verification remains outstanding: install/launch, model download/import, restart persistence, local inference, gallery selection, and offline inference.

## 21. Verified session update — 2026-11-06 (fresh repository and CI observability check)

### Live repository state

- Latest `main` HEAD: `9bc5e64b8620225ac446d851388e4845896388e1` — `docs: record Android Actions cost-control review`.
- Related branch HEAD: `69400451b2036ee1066a68cae37d186ce8e3d0d8`.
- Fresh compare confirms divergence: feature branch **7 commits ahead / 42 behind**; merge base `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`.
- The current diff from feature branch to main spans 18 files, including newer CI/workflow, handover, Jest setup, locale, model/server store and test changes. The old feature branch must not be merged wholesale. No merge, cherry-pick, reset, force-push, or history rewrite was performed.

### CI and Android workflow verification

- Re-fetched `.github/workflows/ci.yml` and `.github/workflows/build-android.yml` from live main.
- Standalone APK workflow trigger remains `workflow_dispatch` only; it builds `assembleProdRelease` with Yarn 1.22.22 and uploads the APK.
- Normal CI Android release job still depends on `build-and-test` and `detect-changes`, and skips translation-only changes. A failed required check therefore prevents the CI Android build.
- Commit-scoped workflow lookup for current main returned no PR-triggered runs. Combined commit-status lookups for current main and its preceding main commit returned empty status arrays. These endpoints do not provide a repository-wide Actions run list; **latest CI result remains unverified**, not passed.
- The available GitHub integration in this session exposes commit-scoped workflow lookup and run/job inspection, but no repository-wide workflow-run listing. The public Actions page could not be retrieved through the available web reader. No workflow run ID could therefore be reliably selected for log inspection.

### Work performed and limits

- Re-verified current branch heads, divergence, Android build triggers/dependencies, package manifest and the latest handover directly from GitHub.
- No production source, tests, dependencies, or lockfile were changed. No CI run was dispatched, rerun, or cancelled; no unnecessary Android build was started.
- No current failure logs were available to safely continue Jest root-cause corrections. Avoid speculative test edits or deleting tests without current evidence.
- No local tests/builds or physical-device verification were performed.

### Next actions

1. Obtain the repository-wide latest Actions runs (CI Pipeline and standalone APK) through an Actions run-list capability, then inspect the latest CI jobs/logs.
2. Resume retained-feature Jest triage using the current failure evidence; preserve local inference, model download/import, persistence, gallery selection and offline behavior.
3. Inspect the seven feature-only commits and selectively reconcile only changes still needed; retain the branch divergence until each patch is reviewed.
4. Continue dependency/native reachability audit and regenerate the lockfile only after the removal set is proven, using Yarn Classic 1.22.22.
5. Keep APK packaging manual-only and device verification outstanding.

## 22. Verified session update — 2026-11-06 (GitHub reconnection and selective branch review)

### GitHub access and Actions retrieval

- Reconnected GitHub account `MasamuneKN` is working for repository reads and writes: latest handover, branch search, commit search, file retrieval, branch comparison, commit status, workflow job summaries, job steps, and decoded job logs all returned live results.
- **The original Actions run-list blocker is only partially resolved.** The available GitHub tool catalog still has no repository-wide workflow-run listing action. `fetch_commit_workflow_runs` is limited to pull-request-triggered runs, so it cannot identify the newest push-triggered CI run by itself. Empty results from it or combined commit status must not be interpreted as a passing build.
- Workflow job detail/log retrieval now works when a run/job ID is known. This is a meaningful improvement over the previous session; it allows inspection of run IDs already present in the handover or elsewhere.
- Re-verified current `main` HEAD: `8505d1ca309bdccb40dae7b3945242afb363d947` — `docs: refresh PocketPal Lite repository status`.
- Re-verified feature branch compare: `refactor/remove-unreachable-features` is **7 commits ahead / 43 behind** main. Merge base remains `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`.

### Latest known CI run and action taken

- Inspected CI Pipeline #42165765676 on code SHA `d5f5aaddc379254faedc3f085df4e68cf3c95e96`. Its `build-and-test` job completed ESLint successfully (0 errors, 51 non-fatal warnings) and TypeScript successfully (`tsc --noEmit`, exit 0), but the job was cancelled immediately afterward; Jest was skipped. The Android and iOS jobs were also cancelled. This is **not** a complete passing CI run.
- Its associated Format/validate run #42165765704 completed successfully.
- Retried only the cancelled `build-and-test` job using GitHub's job-rerun action. GitHub accepted the request (`success: true`). A subsequent query now shows the new attempt running as job `127744912495`; setup has started and validation/test steps are pending. The rerun outcome is therefore **in progress/unverified**. No standalone APK workflow was dispatched.
- The earlier run #42165553255 remains a confirmed failure at ESLint; dependent Android was skipped. Do not use it as evidence about Jest.

### Selective feature-branch review

- Compared the four feature-only files directly between `main` and `refactor/remove-unreachable-features`.
- `__mocks__/stores/modelStore.ts` is identical between branches.
- `__mocks__/services/downloads.ts` differs only in explanatory comments; behavior is identical.
- `scripts/verify-plus-gate.sh` is identical between branches.
- `android/app/build.gradle` differs because the feature branch removes the `PLUS_STORE_GATE` environment input from Hermes bundle task inputs. Main retains this input, which ensures bundle task invalidation when the store-gate build environment changes. Keep main's current behavior; do not cherry-pick this stale feature-branch version.
- No feature-branch commit needs to be merged for these four paths. No merge, cherry-pick, reset, force-push, or history rewrite was performed.

### Work and verification boundaries

- No application source, tests, dependencies, Gradle configuration, or lockfile were modified in this session. No Android build or physical-device test was started.
- No safe production-code cleanup was identified from the available evidence alone. Continue with the retained-feature test run before undertaking coordinated Plus/voice/Pals retirement; confirm every shared/native dependency is unreachable before removal.
- Product scope remains Android/local-first, gallery-only image selection, compact typography, persistent local data, reliable model download/import, and offline inference.

### Next actions

1. Retrieve the result of the accepted rerun of CI job #127722269655 in run #42165765676. If it completes Jest, inspect the failure summary and logs; if it is still unavailable, obtain the current run ID through a repository-wide Actions listing capability.
2. Resume Jest root-cause triage without deleting retained-feature coverage or weakening assertions.
3. Continue the Plus/purchases, voice, and Pals reachability audit across navigation, imports, native modules, resources, workflows, and package dependencies.
4. Keep the feature branch unmerged; its current unique changes are stale or behaviorally redundant.
5. Regenerate `yarn.lock` only after the dependency removal set is established, using Yarn Classic 1.22.22. Keep standalone APK packaging manual-only.

## 23. Verified session update — 2026-11-06 (CI cancellation root cause and trigger fix)

### CI cancellation diagnosis

- The rerun of CI Pipeline #42165765676 (job `127744912495`) completed dependency installation, localization validation, font validation, ESLint (0 errors; 51 warnings), and TypeScript (`tsc --noEmit`, exit 0). GitHub cancelled the job immediately afterward; Jest was skipped and Android/iOS jobs were cancelled.
- The workflow's concurrency group is `pocketpal-lite-ci-${{ github.ref }}` with `cancel-in-progress: true`. Every push to `main`, including handover-only commits under `docs/`, therefore starts a new run that can cancel the existing run. The handover commit `cacfa6c7e779417badbe70f810bb152d8874037c` landed while the rerun was active, matching the cancellation window. This is the likely cause; no Jest failure is evidenced.
- Fixed `.github/workflows/ci.yml` on `main` with commit `c88a025f042a6d5a42889438e84bc52e8408433c`: both `push` and `pull_request` triggers now use `paths-ignore` for `docs/**` and `**/*.md`. Mixed documentation + code changes still trigger CI; manual `workflow_dispatch` remains available.
- Re-fetched the workflow from live `main` and verified the new trigger filters. Workflow blob SHA: `cf0b4729caa6fcbb6bc44a16126ebafd46af695c`.

### Current validation state and next steps

- The cancellation issue is addressed in workflow configuration, but a fresh complete CI run has not yet been confirmed. Do not report Jest or Android as passing.
- Next, retrieve the CI run triggered by commit `c88a025f042a6d5a42889438e84bc52e8408433c` if a run ID becomes available; confirm lint, typecheck, Jest, and dependent Android job separately.
- Once a full Jest run is available, continue root-cause triage without deleting retained-feature tests or weakening assertions.
- Continue Plus/purchases, voice, and Pals reachability audit only after reliable baseline CI is available. Keep APK packaging manual-only and the feature branch unmerged.

## 24. Verified session update — 2026-11-06 (latest commit and Jest source review)

### Latest main commit

- Verified `main` HEAD before this update: `dd82bc6c414c33cfdfe235cc9f2d02e71d979a66` (`chore: apply repository Prettier formatting`). Its only changed file was `docs/PROJECT_HANDOVER.md`, with one blank-line addition. No app source or tests changed in that commit.
- Reviewed the Jest configuration and targeted test/source pairs. `tsconfig.json` explicitly excludes `**/__tests__/**` and `*.test.ts(x)`, explaining why TypeScript CI could pass despite a test-only undefined identifier.

### Confirmed Jest test defect corrected

- `src/screens/ModelsScreen/FABGroup/__tests__/FABGroup.test.tsx` referenced undeclared `mockOnAddRemoteModel` twice and passed obsolete `onAddRemoteModel` props, although `FABGroup` accepts only `onAddHFModel` and `onAddLocalModel`. These references would throw at test execution and do not belong to the current two-action (Hugging Face + local) FAB contract.
- Removed both obsolete prop references. The corrected test file was re-fetched from `main` and verified at blob SHA `ce35b5693d71e664ebc253c360b1b203e1f6f513`. Commit: `e403dd891ff5bfbf5e11200ed5a3c7038ed2896b` (`test: remove obsolete remote model FAB prop`).
- This is a confirmed test defect, not proof that it was the only cause of prior Jest failures. No Jest run was executed from the repository-reading session; all runtime test outcomes remain unverified.

### Additional scope/reachability observations

- Current `FABGroup` implementation exposes only HF and local model actions, matching the corrected test.
- The repository tree contains a `react-native-vision-camera` Jest mock and a camera SVG asset but no camera-named production component/source path under `src`. `package.json` still declares `react-native-vision-camera`; treat it as a removal candidate, not yet proven safe to remove, until import/native autolinking and lockfile impact are checked.
- The source tree still contains substantial Plus/IAP, PalsHub/Pals, and voice/TTS/ASR code and corresponding tests. Navigation removal alone does not prove every module unreachable. Continue an import/native/resource/workflow reachability audit before removing packages or test suites.

### Next priorities

1. Run the corrected focused FABGroup Jest test and then the full Jest suite when a repository execution path is available; inspect actual failure output rather than guessing.
2. Continue targeted test/source triage for previously troublesome ChatHeader, ChatHeaderTitle, ModelsHeaderRight, locale, and talent/web-search tests.
3. Audit `react-native-vision-camera` and other unused native dependencies across source imports, Android autolinking, iOS pods, and lockfile before removal.
4. Continue coordinated Plus/IAP, PalsHub, and voice/ASR/TTS retirement only after each dependency's reachability is established. Preserve local inference, model download/import, persistence, gallery selection, and offline operation.
5. Keep `yarn.lock` generated with Yarn Classic 1.22.22; never hand-edit it. Keep APK packaging manual-only.

## 25. Verified session update — 2026-11-06 (production navigation reachability audit)

- Read live `App.tsx`, `src/screens/index.ts`, `src/utils/navigationConstants.ts`, `useDeepLinking.ts`, `HubRunSheetHost.tsx`, and `SettingsScreen.tsx`.
- The production drawer registers only Chat, Models, Settings, and App Info; Dev Tools is conditional on `__DEV__`. `src/screens/index.ts` exports only those screens plus DevTools. Pals, Plus, and Benchmark screens are not registered or exported through the production screen barrel.
- `useDeepLinking` production behavior handles Chat links and the exact `hub/run` model-download link. Automation deep-link dispatch is gated by `__E2E__`; benchmark and Plus test feature routes belong to that E2E boundary. `HubRunSheetHost` remains a production local model acquisition path and must not be removed as part of PalsHub retirement.
- `ROUTES.PALS` and `ROUTES.BENCHMARK` remain declared in `navigationConstants.ts`, but no production drawer screen uses them. Do not delete constants until all source/tests/automation references are searched and accounted for.
- `SettingsScreen` is still a substantial retained local model/device/settings surface; preserve it. The app's current production navigation confirms route-level retirement, but not full module/dependency unreachability.
- Native dependency audit: `package.json` still includes `react-native-vision-camera`, and `ios/Podfile.lock` still resolves VisionCamera 4.7.2. The recursive source-tree inventory found only the VisionCamera Jest mock and a camera SVG under `src`; this is a strong unused-dependency candidate under the gallery-only decision, but a complete source import/autolinking audit and Yarn/Pods lockfile regeneration are still required before removal.

### Next implementation order

1. Obtain a runnable repository execution path and run `FABGroup.test.tsx` followed by full Jest; the undefined test identifier was fixed, but runtime verification remains outstanding.
2. Finish a complete reference search for VisionCamera and remove it only together with regenerated Yarn and iOS native lockfiles if no production consumer exists.
3. Audit Plus/IAP and PalsHub imports from production entry points, shared stores, deep links, and native modules; remove unreachable surfaces in coordinated small commits.
4. Audit voice separately: ChatScreen and ChatView are production routes, so voice/TTS/ASR cannot be removed merely because standalone voice screens are not drawer routes.
5. Preserve local model download/import, HF acquisition, inference, chat persistence, gallery image selection, and offline behavior. Keep APK packaging manual-only.

## 26. Verified session update — 2026-11-06 (native dependency and branch recheck)

### Live branch state

- Live `main` HEAD: `c1a088bef59eadfec430d7b13b98756f37bbcdb2` — `chore: apply repository Prettier formatting` (formatting-only commit; parent is the prior handover update).
- Live `refactor/remove-unreachable-features` HEAD: `69400451b2036ee1066a68cae37d186ce8e3d0d8`.
- Fresh GitHub compare: branches remain **diverged**; feature branch is 7 commits ahead and **52 commits behind** main, merge base `ea05e3a2f5c83c7f2944b043c5b3d09ed6e3deaf`. Its current four-file diff remains limited to the two shared Jest mocks, `android/app/build.gradle`, and `scripts/verify-plus-gate.sh`. Do not merge or cherry-pick the branch wholesale.

### VisionCamera audit update

- `react-native.config.js` explicitly disables `react-native-vision-camera` autolinking on both Android and iOS.
- Android manifest contains no camera permission or camera component/service.
- Repository tree contains no camera-named production source path; only the VisionCamera Jest mock and a camera SVG asset were found under `src`. GitHub code search for the package name and `VisionCamera` returned zero results; treat this as supporting evidence, not a substitute for a local full-text search.
- `package.json` still declares `react-native-vision-camera@^4.7.2`. `ios/Podfile.lock` still contains VisionCamera 4.7.2 and a local path entry, indicating stale iOS lockfile state. Since the agreed target is Android-only, do not spend time repairing iOS Pods; remove the JS dependency only when a clean Yarn Classic 1.22.22 lockfile regeneration can be performed and verified.
- No source, dependency, or lockfile changes were made in this review. No Jest or build was run; repository-reading tools cannot execute the test suite.

### Next actions

1. Obtain a runnable checkout/environment and run focused Jest tests, then classify full-suite failures by shared mock drift versus retained-feature regressions.
2. Complete the source import audit for camera and remaining retired-feature dependencies before any package removal.
3. Keep the 7-commit feature branch untouched until its unique mock/build changes are individually inspected against the 52 newer main commits.
4. Preserve local model acquisition, inference, persistence, gallery selection, and offline operation. Avoid Android APK builds unless the required checks pass and a build is actually needed.

## 27. Verified session update — 2026-11-06 (chat voice reachability review)

- Inspected the current production chat path: `src/screens/ChatScreen/ChatScreen.tsx`, `src/components/ChatView/ChatView.tsx`, and `src/components/ChatInput/ChatInput.tsx`. These files do not import or expose the voice-mode controls or voice-capture hooks inspected in this review.
- The repository still contains substantial disconnected voice implementation: `VoiceModeButton`, `VoiceModeView`, `useVoiceMode`, `useVoiceCapture`, Whisper ASR, TTS engines, voice stores/services, automation adapters, assets, mocks, and tests. The current ChatScreen/ChatView/ChatInput path does not establish a production entry point to these modules.
- This narrows the likely retirement boundary, but does **not** yet prove every voice module is unreachable: a complete import graph across all production entry points and automation/E2E boundaries is still required. Do not remove the Whisper/TTS dependencies or broad test groups based only on the chat-path inspection.
- No app source or dependency files were changed. No tests/builds were run; execution remains unavailable through repository-reading tools.
- Next: finish import-reference tracing for voice entry components and shared stores, then remove only the unreachable production surface and its associated dependencies/tests in coordinated, verifiable changes. Keep local text inference and gallery image selection untouched.

## 28. Follow-up correction — voice barrel exports remain

- Further inspection found `src/components/index.ts` still re-exports multiple voice components, and `src/store/index.ts` still re-exports `TTSStore`, `ASRStore`, and `VoiceModeStore`.
- These barrel exports are additional potential import paths. The earlier finding is limited to the direct ChatScreen → ChatView → ChatInput implementation; it is **not** proof that voice modules are globally unreachable.
- Before removal, trace every import of these barrels and each exported voice symbol, including E2E/automation paths. Remove stale barrel exports only after confirming there are no consumers. Keep the voice feature retirement coordinated with native autolinking, permission setup, dependency declarations, patches, and tests.

## 29. Verified session update — 2026-11-06 (production TTS vs stale voice-mode tests)

- Rechecked live `main` HEAD: `d62658aeee359cf8e8707931ff2ea341fad9f3bf` before this handover update.
- **TTS is retained production functionality.** `src/hooks/useChatSession.ts` imports `ttsStore` and streams assistant tokens, reasoning, completion, stop, and error events into TTS. Do not remove `TTSStore`, TTS engines, voice-file handling, or their dependencies as part of voice-mode retirement.
- **Voice-mode test/source mismatch:** `src/screens/ChatScreen/__tests__/ChatScreen.voiceMode.test.tsx` expects `voice-mode-button`, `voice-teaser`, VoiceSetupSheet, and VoiceMemorySheet behavior. Current `src/screens/ChatScreen/ChatScreen.tsx` contains no voice-mode imports or references; current `src/components/ChatInput/ChatInput.tsx` likewise contains no voice-mode button. The test appears stale relative to production source and likely fails at its first missing testID. This is a finding from static inspection only; Jest was not run.
- `AutomationBridge.tsx` mounts TTS and Voice adapters for automation. These are automation/E2E surfaces, not proof of ordinary user-facing navigation. Preserve them until E2E usage and compile-time gates are audited; do not treat automation-only files as production UI.
- `src/store/index.ts` barrel exports TTS, ASR, and VoiceMode stores, while `src/components/index.ts` barrel exports multiple voice UI components. The barrel exports alone do not establish that each symbol is consumed. Trace direct imports and automation entry points before deleting exports.
- **Safe next step:** verify and, if confirmed, remove or rewrite only the obsolete ChatScreen voice-mode test to reflect the current product contract. Do not delete retained TTS coverage. Then continue the ASR/VoiceMode production-import audit and run Jest in a real checkout before dependency cleanup.
- No app source, test, or dependency files were changed in this review. No Jest or build was run.

## 30. Verified session update — 2026-11-06 (obsolete ChatScreen voice-mode test retirement)

- Live `main` before the test cleanup: `8ac5ce6f313b3474fc8767a16952d3223284fb89`. Latest commit after cleanup: `ab507108b6e1373c5d9b875dbb6d8adcf3c3fe56`.
- Re-read the complete `src/screens/ChatScreen/__tests__/ChatScreen.voiceMode.test.tsx`. Every test in the 8.1 KB file covered the removed ChatScreen voice-mode entry flow: `voice-mode-button`, Plus-gated teaser, VoiceSetupSheet/VoiceMemorySheet, and the full voice view. It did not cover retained text-to-speech.
- Confirmed against current production sources that `ChatScreen.tsx` has no voice-mode integration and `ChatInput.tsx` has no voice-mode control. `ChatView.tsx` likewise imports no voice-mode UI. The file was therefore an obsolete test suite for a UI no longer present in the product path, not a retained-feature regression test.
- Removed only that stale test file in commit `ab507108b6e1373c5d9b875dbb6d8adcf3c3fe56` (`test: remove obsolete chat voice-mode suite`). GitHub returned 404 when re-fetching the deleted path, confirming it is absent from `main`.
- TTS remains retained: `useChatSession.ts` imports `ttsStore` through the store barrel and routes assistant output events into TTS. `AutomationBridge.tsx` also mounts TTS and Voice adapters behind the E2E gate. No TTS source, automation adapter, ASR/voice service, dependency, or lockfile was removed.
- No Jest command or build was run; repository-reading tools cannot execute tests. This cleanup is based on the confirmed product/source mismatch and must not be reported as a passing test result.
- Next: trace direct production imports of ASR/VoiceMode components and stores separately from E2E-only adapters; preserve TTS. Continue the dependency/native reachability audit and only regenerate the Yarn lockfile after a complete, evidence-backed removal set is identified.

## 31. Verified source review — 2026-11-06 (retired ChatView voice-input test cleanup)

- Current `main` included automated formatting commit `bd681d330324d138aafc5b26d2931695638739c1` after the previous handover update. The ChatScreen voice-mode test removal is recorded in section 30.
- Inspected the full `src/components/ChatView/ChatView.tsx` (1,208 lines) and its `ChatView.voiceInput.test.tsx` (419 lines). The current ChatView source contains no references to voice, ASR, `MicButton`, or `useVoiceCapture`. Every test in the latter file exercises the absent voice-input or voice-mode seams; its nested message-menu/suggested-prompt cases also assert behavior conditional on the removed voice-mode state.
- Confirmed current `ChatScreen.tsx`, `ChatInput.tsx`, and `SettingsScreen.tsx` contain no voice/ASR/TTS UI references. This is limited to the inspected files and does not establish global module unreachability.
- Removed the obsolete 419-line `src/components/ChatView/__tests__/ChatView.voiceInput.test.tsx` in commit `15e21b31ef102ddaf393cc094e552979be336e69` (`test: remove obsolete chat voice-input suite`). No production component or assertion in retained chat functionality was modified.
- **Do not remove TTS.** `useChatSession.ts` still wires assistant output to `ttsStore`; TTS setup UI and E2E profiling remain in the tree.
- ASR/MicButton and VoiceMode modules still exist, and the E2E `VoiceAdapter` imports voice automation. The component/store barrels also re-export voice modules. GitHub code-search returned no indexed results for several symbol searches, so that result is not treated as proof of non-use. A complete import graph is still required before removing modules, adapters, native packages, or lockfile entries.
- Per user instruction, no tests, lint, typecheck, builds, or GitHub Actions were run for this update. Do not imply runtime verification.
- Next implementation: inspect the full production import graph and E2E boundary; then remove the clearly unreachable ASR/VoiceMode UI and implementation in coherent batches while retaining TTS. Preserve model download/import, local inference, persistence, and gallery selection. Regenerate the Yarn lockfile only when a runnable Yarn Classic 1.22.22 environment is available; do not hand-edit it.

## 32. Session update — 2026-11-06 (voice/ASR boundary and execution policy)

- Live `main` HEAD before this handover update: `adc414b0dc500e4590e7ed15d082df46ca6ce234` (`chore: apply repository Prettier formatting`). The formatting commit follows the prior documented source cleanup.
- Re-read the live component/store barrels, `MicButton`, `ASRStore`, `VoiceModeStore`, `useVoiceCapture`, `useVoiceMode`, `AutomationBridge`, `VoiceAdapter`, and the ASR/voice automation drivers.
- TTS remains a retained chat-generation integration through `useChatSession`; do not remove TTS stores, engines, setup, or dependencies.
- ASR and VoiceMode are still present in the component/store barrels and have E2E automation paths. `AutomationBridge` mounts TTS/IAP/Voice adapters behind the `__E2E__` gate. The ASR and voice automation drivers directly manipulate their respective stores. These paths must be accounted for before removing the related modules or exports.
- GitHub code search returned no results for `MicButton`, `VoiceModeView`, `VoiceModeButton`, `MicSetupSheet`, `VoiceRecordingBar`, `voiceModeStore`, and `asrStore`. The index has previously returned empty results for known symbols; this is not evidence of global unreachability. No production modules, barrel exports, stores, automation adapters, or dependencies were deleted in this review.
- The component barrel currently exports the voice UI modules; the store barrel exports TTS, ASR, and VoiceMode stores. TTS exports are required. ASR/VoiceMode export removal remains blocked on a reliable repository-wide reference audit.
- **Execution policy (user instruction, supersedes earlier verification steps in this document):** do not run tests, lint, typecheck, Android builds, or GitHub Actions. The user will inspect build status independently. Continue with static source inspection and safe code changes only; do not claim runtime verification. Do not start APK builds merely to check a change.
- No app source or test files were changed in this session. The only change is this handover update. Physical-device verification remains for the user.
- Next: continue the ASR/VoiceMode import and E2E boundary audit using source/tree evidence that does not depend on the unavailable code-search index. Preserve TTS, local inference, model download/import, persistence, and gallery selection.

## 33. Session update — 2026-11-06 (source-tree and automation boundary review)

- Live `main` HEAD before this update: `cb2aebfa5e3488d8cd733c55cbce9974c54f3e10`.
- Reviewed the recursive repository tree (1,989 tracked files), app entry point, component/hook/store/service barrels, chat and settings screen imports, package manifest, and E2E deep-link dispatcher.
- `App.tsx` mounts ChatScreen, ModelsScreen, SettingsScreen, AboutScreen, and debug-only DevToolsScreen. The current ChatScreen imports ChatView directly; ChatInput imports SendButton/StopButton/Menu directly. Neither ChatScreen nor ChatInput imports the voice-mode or ASR components. SettingsScreen likewise has no ASR/VoiceMode/TTS surface imports in its current source.
- `src/components/index.ts` still re-exports MicButton, MicSetupSheet, VoiceModeView, VoiceBar, VoiceModeButton, VoiceTeaser, VoiceSetupSheet, VoiceMemorySheet, VoiceRecordingBar, and other voice-related UI. `src/hooks/index.ts` still re-exports useVoiceCapture/useVoiceMode. `src/store/index.ts` still re-exports ASRStore, TTSStore, and VoiceModeStore. Shared-barrel consumers have not yet been exhaustively enumerated; do not remove exports or modules on this evidence alone.
- `src/__automation__/index.ts` exports AutomationBridge. AutomationBridge mounts VoiceAdapter under the `__E2E__` guard; the E2E deep-link dispatcher dynamically requires ASR and VoiceMode automation handlers for `asr` and `voice` commands. These are deliberate E2E surfaces, not production UI imports. Preserve them until the E2E contract is explicitly retired and its tests/specs are audited.
- TTS remains separate and actively wired into chat generation. The TTS store and engine modules are retained. The package manifest also contains ASR dependencies (`@fugood/react-native-audio-pcm-stream`, `whisper.rn`) and TTS dependencies (`@pocketpalai/react-native-speech`, `@pocketpalai/react-native-speech-phonon`); do not conflate their removal.
- The manifest still declares `react-native-vision-camera`; the earlier native configuration audit records disabled autolinking and no camera feature path in the tracked production tree. Dependency removal remains deferred until import/config/lockfile regeneration can be done safely.
- No source code was changed in this review: a reliable repository-wide import search is still unavailable, and deleting shared-barrel exports without enumerating consumers could break unrelated modules. No tests, lint, typecheck, builds, or Actions were run, per user instruction.
- Next: establish all importers of the component and hook barrels through direct source inspection or a reliable local repository snapshot. Then remove only dead exports/modules and update E2E fixtures deliberately; keep TTS and supported offline chat functionality untouched.

## 34. Session update — 2026-11-06 (barrel-import audit attempt)

- Re-read the live handover and confirmed current `main` HEAD is `093dae7578a5d233d027b60cc36e7b0d9ba345ce`.
- Re-inspected the complete component, hook, and store barrel exports, package manifest, Babel/Metro/TypeScript configuration, and E2E AutomationBridge.
- The component barrel still exports ASR/VoiceMode UI; the hook barrel exports `useVoiceCapture` and `useVoiceMode`; the store barrel exports ASR, VoiceMode, and retained TTS stores. The TTS store remains required by chat generation and must stay.
- The E2E AutomationBridge statically imports VoiceAdapter and mounts it behind the compile-time `__E2E__` gate. The E2E deep-link dispatcher and automation handlers remain part of the test contract. Do not remove these paths without an explicit E2E retirement decision.
- Attempted repository-scoped GitHub code searches for barrel imports and representative voice symbols. The connected search index returned no results for every query, including known barrel and symbol names. As previously established, this index is not reliable enough to prove absence of imports. No export, module, dependency, or test deletion is justified by those empty results.
- The VisionCamera dependency remains a candidate based on the prior Android-only native audit, but removing it from `package.json` alone would leave `yarn.lock` inconsistent. No lockfile or dependency change was made because a clean Yarn Classic 1.22.22 regeneration environment is unavailable.
- No production source change was made in this pass: the remaining candidates require a reliable full import graph or lockfile regeneration. This avoids breaking indirect barrel consumers or the E2E build.
- Per user instruction, no tests, lint, typecheck, Android builds, or GitHub Actions were run. No runtime verification is claimed.
- Next: obtain a local checkout or another reliable full-text source scan, then enumerate all imports from the three barrels and trace ASR/VoiceMode symbols separately from retained TTS. Continue Plus/IAP and Pals audits only after their production entry points and E2E contracts are mapped.

## 35. Session update — 2026-11-06 (Plus/IAP and Pals coupling review)

- Reviewed the app entry point, `PlusHost`, `PurchaseStore`, `PalStore`, `HubRunSheetHost`, PalsHub service barrel, and E2E IAP/memory adapters.
- `App.tsx` mounts the local Hugging Face `HubRunSheetHost`; this is part of model acquisition and must be retained. It is not evidence of a PalsHub screen.
- `PurchaseStore` is not an isolated Plus-only module: it imports IAP services, Plus catalog/gating, PalsHub events/types, and the PalStore; its ledger models both Plus entitlements and paid Pal content. Removing it or its dependencies as a simple Plus cleanup would risk corrupting purchase recovery and PalStore behavior.
- `PalStore` still contains PalsHub search/library operations, remote Pal conversion and ownership methods, and local default-Pal seeding. These are broad product surfaces, but the current evidence does not establish which store methods are reached by supported chat, migration, or onboarding paths.
- `PlusHost` imports and renders `PlusScreen`, RAM gating, Plus entitlement checks, and focus-return behavior. The app entry point inspected here does not mount `PlusHost` directly; however, a full consumer/import trace is still required before removing the host, Plus screen, gate, or related tests.
- E2E `IapAdapter` is explicitly mounted through AutomationBridge and drives the fake store. Preserve it until the E2E IAP contract and all associated specs are intentionally retired. MemoryAdapter is a separate E2E profiling surface.
- These findings show that Plus/IAP and Pals cannot safely be retired by deleting named folders or dependencies in isolation. No source changes were made; the connected repository code-search index remains unavailable, and no reliable full-text import graph is currently exposed.
- Per user instruction, no tests, lint, typecheck, builds, or Actions were run. No runtime verification is claimed.
- Next: trace the consumers of `PurchaseStore`, `PalStore`, `PlusHost`, and PalsHub services from screens, onboarding, chat/session state, migrations, and E2E specs. Identify a supported local-Pal contract separately from remote PalsHub functionality before retiring either.

## 36. Session update — 2026-11-06 (application entry-point reachability review)

- Re-read the live handover. The latest observed `main` commit before this entry was `6aacb6823a03e076c379634fec82ed8e499bbe9b`, an automated Prettier commit following section 35.
- Rechecked the actual application composition: `App.tsx` registers Chat, Models, Settings, About, and debug-only Dev Tools. `src/screens/index.ts` exports only those screens; it does not export `PalsScreen` or `PlusScreen`.
- The live drawer implementation exposes Chat, Models, Settings, About, and debug-only Dev Tools. It does not expose Pals or Plus. `ROUTES.PALS` remains as a route constant, but no registration or drawer entry for it was found in the inspected app path.
- `SettingsScreen.tsx` imports and renders its own settings controls directly. It does not import `PurchasesCard` or `AccountCard`; the SettingsScreen barrel exports only `SettingsScreen`. The two card files still contain account/PurchaseStore/PalsHub UI code, but no production consumer was established in this review.
- `PlusHost` is re-exported from the components barrel but is not imported by `App.tsx`; `PlusScreen` is not part of the screens barrel or drawer registration. This establishes that neither is part of the inspected primary app composition, not that no indirect consumer exists elsewhere.
- `PalsScreen` has a local index file but is absent from the screens barrel and primary drawer registration. `PalStore` itself must remain for local Pal/chat data and default-Pal seeding; the unmounted marketplace screen and remote PalsHub methods are separate concerns.
- The repository-wide code-search endpoint returned zero matches even for these known symbols, so its results remain unusable as proof of global non-reference. No source files were deleted in this pass; deleting candidate screens or exports without a trustworthy importer inventory could break a hidden route, test, or E2E path.
- No tests, lint, typecheck, Android builds, or GitHub Actions were run, following the user's explicit instruction. No runtime verification is claimed.
- Next: use the complete tree/blob inventory to build a source-level reference map for these specific candidate modules and their barrels. Prioritize a safe removal of unmounted legacy UI only after every direct import and E2E/test reference is accounted for; preserve the local Pal model and chat integration.
