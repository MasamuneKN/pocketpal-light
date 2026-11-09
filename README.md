# PocketPal Lite

**An Android-only, local-first AI assistant.**

PocketPal Lite runs language models on the Android device. Model discovery and model downloads are the only app features that require an internet connection. Once a model is downloaded, chat and model inference run locally.

## Scope

- **Android only.** There is no iOS project, target, build workflow, or platform-specific app configuration.
- **Local inference.** Chat and model execution run on the device.
- **Model downloads.** Browse the Hugging Face model catalog and download model files. A Hugging Face access token may be used for gated or private model downloads.
- **Local model management.** Imported and downloaded models are stored on the device.
- **Local persistence.** Chat sessions, settings, and benchmark history are stored locally.
- **Gallery images.** Attach images selected from the device gallery when using a compatible vision model. The app does not capture images with the camera.
- **Local benchmarks.** Run benchmarks and view saved results on-device.

There is no cloud sign-in, PalsHub, online feedback or reporting, online benchmark submission, analytics, or remote chat/inference service.

## Network boundary

The app's permitted network use is limited to Hugging Face model discovery and model-file downloads. It does not send chat messages, prompts, images, benchmark results, feedback, or error reports to a server.

An internet connection is needed to discover and download a model. After the model is stored locally, inference does not require a connection.

## Android development

### Requirements

- Node.js and Yarn compatible with the versions used by this repository
- JDK and Android SDK required by the checked-in Gradle/React Native versions
- Android NDK `27.3.13750724` for native Android builds
- An Android device or emulator for runtime testing

### Install dependencies

```bash
yarn install
```

The post-install script applies repository patches and prepares the OpenCL headers used by the Android native build.

### Run the app

Connect an Android device with USB debugging enabled, or start an Android emulator, then run:

```bash
yarn android
```

### Checks

```bash
yarn lint
yarn typecheck
yarn l10n:validate
yarn verify:fonts
yarn test
```

### Android build commands

```bash
yarn build:android
yarn build:android:release
```

Release packaging is intentionally a separate, manually controlled step. Do not run release packaging until the project's pre-packaging checks and release restrictions have been cleared.

## Project structure

- `android/` — Android Gradle project and native modules
- `src/` — React Native application source
- `scripts/` — validation and Android build support scripts
- `e2e/` — Android end-to-end test configuration
- `docs/PROJECT_HANDOVER.md` — current project decisions, verified status, and next work

## License

See [LICENSE](LICENSE).
