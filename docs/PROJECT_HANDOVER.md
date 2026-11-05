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
