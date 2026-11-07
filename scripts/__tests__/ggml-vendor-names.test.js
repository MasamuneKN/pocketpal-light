const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const VENDORED_GGML = path.join(
  ROOT,
  'node_modules',
  'llama.rn',
  'vendor',
  'llama.cpp',
  'ggml',
);
const HEXAGON_HEADER = path.join(VENDORED_GGML, 'include', 'ggml-hexagon.h');
const MAIN_APPLICATION = path.join(
  ROOT,
  'android/app/src/main/java/com/pocketpalai/MainApplication.kt',
);
const MANIFEST = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'android-payload-manifest.json'),
    'utf-8',
  ),
);

const APP_ROOTS = ['android/app/src', 'src'];
const APP_FILES = fs
  .readdirSync(path.join(ROOT, 'scripts'))
  .filter(name => name.endsWith('.json'))
  .map(name => `scripts/${name}`);
const EXEMPT = new Set(['src/__automation__/logSignals.ts']);
const SOURCE_EXT = /\.(kt|java|gradle|h|ts|tsx|js|json)$/;

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' || entry.name === 'node_modules'
        ? []
        : walk(full);
    }
    return SOURCE_EXT.test(entry.name) ? [full] : [];
  });
}

function sources(dir, ext) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return sources(full, ext);
    }
    return ext.test(entry.name) ? [full] : [];
  });
}

const getenvNames = files =>
  new Set(
    files.flatMap(file =>
      [
        ...fs
          .readFileSync(file, 'utf-8')
          .matchAll(/getenv\(\s*"([A-Z0-9_]+)"\s*\)/g),
      ].map(match => match[1]),
    ),
  );

const androidSetenvNames = [
  ...fs
    .readFileSync(MAIN_APPLICATION, 'utf-8')
    .matchAll(/Os\.setenv\(\s*"([^"]+)"/g),
].map(match => match[1]);

const llamaSetenvNames = androidSetenvNames.filter(name =>
  name.startsWith('GGML_'),
);

const hexagonMustExport = MANIFEST.abis.flatMap(abi =>
  abi.requiredSymbols
    .filter(rule => rule.kind === 'backend')
    .flatMap(rule => rule.mustExport),
);

describe('the Android app names shared with vendored ggml', () => {
  it('sets GGML environment variables in the Android application', () => {
    expect(llamaSetenvNames.length).toBeGreaterThan(0);
    expect(androidSetenvNames).toEqual(llamaSetenvNames);
  });

  it("sets only GGML_ env vars that llama.rn's vendored ggml reads", () => {
    const read = getenvNames(
      sources(path.join(VENDORED_GGML, 'src'), /\.(c|cpp|h|hpp)$/),
    );
    expect(llamaSetenvNames.filter(name => !read.has(name))).toEqual([]);
  });

  it('finds the Hexagon symbols the Android payload gate requires', () => {
    expect(hexagonMustExport.length).toBe(2);
    const header = fs.readFileSync(HEXAGON_HEADER, 'utf-8');
    for (const symbol of hexagonMustExport) {
      expect(header).toMatch(new RegExp(`\\b${symbol}\\s*\\(`));
    }
  });

  it('sets or passes no lm_-prefixed ggml name', () => {
    const files = [
      ...APP_ROOTS.flatMap(root => walk(path.join(ROOT, root))),
      ...APP_FILES.map(file => path.join(ROOT, file)),
    ];
    const offenders = files
      .map(file => path.relative(ROOT, file))
      .filter(file => !EXEMPT.has(file))
      .filter(file =>
        /LM_GGML|lm_ggml/.test(fs.readFileSync(path.join(ROOT, file), 'utf-8')),
      );
    expect(offenders).toEqual([]);
  });
});
