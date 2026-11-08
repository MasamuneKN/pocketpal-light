const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const CONSUMED_PATHS_FILE = path.join(
  ROOT,
  'scripts',
  'hexagon-sdk-consumed-paths.txt',
);
const LLAMA_RN_CMAKE = [
  path.join(
    ROOT,
    'node_modules/llama.rn/android/src/main/rnllama/CMakeLists.txt',
  ),
  path.join(ROOT, 'node_modules/llama.rn/android/src/main/CMakeLists.txt'),
];

/**
 * The provisioning action verifies a digest over a narrow subset of the ~3 GB
 * SDK. Besides literal HEXAGON_SDK_ROOT paths in llama.rn's CMake, the subset
 * includes transitive toolchain dependencies required by those paths.
 */
const TRANSITIVE_DEPENDENCIES = {
  'ipc/fastrpc/incs': 'FastRPC headers included by SDK headers',
  build: 'SDK build support files required by toolchain scripts',
  'tools/HEXAGON_Tools/21.0.04':
    'the pinned Hexagon compiler and linker toolchain',
  'rtos/qurt': 'QURT headers and libraries used by Hexagon targets',
};

/**
 * Paths llama.rn references that this repackaging does not ship. A compiler
 * ignores a missing include directory, so nothing is consumed from them.
 */
const NOT_SHIPPED = {
  'utils/examples': 'absent from the snapdragon-toolchain repackaging',
};

const cmakeSources = LLAMA_RN_CMAKE.map(file =>
  fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '',
).join('\n');

const referenced = [
  ...new Set(
    [...cmakeSources.matchAll(/\$\{HEXAGON_SDK_ROOT\}\/([^\s")]+)/g)].map(
      match => match[1],
    ),
  ),
].sort();

const consumedPaths = fs
  .readFileSync(CONSUMED_PATHS_FILE, 'utf-8')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

describe('the parse itself', () => {
  it('finds the SDK paths llama.rn references', () => {
    expect(referenced.length).toBe(5);
  });

  it('finds the paths the provisioning action digests', () => {
    expect(consumedPaths.length).toBeGreaterThan(0);
    expect(new Set(consumedPaths).size).toBe(consumedPaths.length);
  });
});

describe('the verified subset covers what the build consumes', () => {
  const covers = (consumed, ref) =>
    ref === consumed || ref.startsWith(`${consumed}/`);

  it.each(referenced)('%s', ref => {
    if (NOT_SHIPPED[ref]) {
      return;
    }
    expect(consumedPaths.some(consumed => covers(consumed, ref))).toBe(true);
  });

  it('accounts for every transitive toolchain dependency', () => {
    const extras = consumedPaths.filter(
      consumed => !referenced.some(ref => covers(consumed, ref)),
    );
    expect(extras.sort()).toEqual(Object.keys(TRANSITIVE_DEPENDENCIES).sort());
  });

  it('states why each referenced path it skips is not shipped', () => {
    const skipped = referenced.filter(
      ref => !consumedPaths.some(consumed => covers(consumed, ref)),
    );
    expect(skipped).toEqual(Object.keys(NOT_SHIPPED));
  });
});
