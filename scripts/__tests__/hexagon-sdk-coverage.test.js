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
 * SDK — the parts the Android build reads or links. That subset is only sound
 * while it still covers what llama.rn's CMake actually references. A widened
 * include set would otherwise leave the digest green over a stale, narrower
 * set, and on a cache hit the tarball digest is not there to catch it.
 *
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
  // Without these, a rename on either side makes every assertion below pass
  // over an empty set.
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

  it('digests nothing that llama.rn does not reference', () => {
    const unreferenced = consumedPaths.filter(
      consumed => !referenced.some(ref => covers(consumed, ref)),
    );
    expect(unreferenced).toEqual([]);
  });

  it('states why each referenced path it skips is not shipped', () => {
    const skipped = referenced.filter(
      ref => !consumedPaths.some(consumed => covers(consumed, ref)),
    );
    expect(skipped).toEqual(Object.keys(NOT_SHIPPED));
  });
});
