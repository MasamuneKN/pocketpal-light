#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  readDynsym,
  readElfLoadSegmentAlignment,
  readElfRelroAlignment,
} = require('./verify-android-payload');

const root = path.resolve('native-output');
const manifest = JSON.parse(
  fs.readFileSync('scripts/android-payload-manifest.json', 'utf8'),
);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile() && file.endsWith('.so')) files.push(file);
  }
}
if (!fs.existsSync(root)) throw new Error('native-output directory is missing');
walk(root);
if (!files.length)
  throw new Error('No generated shared libraries were collected');

let failures = 0;
const parsed = new Map();
for (const file of files) {
  try {
    const bytes = fs.readFileSync(file);
    const loads = readElfLoadSegmentAlignment(bytes);
    const relro = readElfRelroAlignment(bytes);
    parsed.set(file, {bytes, symbols: readDynsym(bytes)});
    console.log(
      `PASS | ELF 16 KB | ${file} | ${loads.length} PT_LOAD | RELRO ${relro.status}`,
    );
  } catch (error) {
    failures++;
    console.error(`FAIL | ELF 16 KB | ${file} | ${error.message}`);
  }
}

for (const abi of manifest.abis) {
  const abiFiles = files.filter(file => file.includes(`/obj/${abi.abi}/`));
  if (!abiFiles.length) {
    failures++;
    console.error(`FAIL | missing ABI output | ${abi.abi}`);
    continue;
  }
  console.log(`ABI ${abi.abi}: ${abiFiles.length} generated libraries`);
  for (const name of abi.requiredLibs) {
    const file = abiFiles.find(candidate => path.basename(candidate) === name);
    if (!file) {
      failures++;
      console.error(`FAIL | missing required library | ${abi.abi}/${name}`);
      continue;
    }
  }
  for (const rule of abi.requiredSymbols || []) {
    const file = abiFiles.find(
      candidate => path.basename(candidate) === rule.lib,
    );
    const record = file && parsed.get(file);
    if (!record) continue;
    const missing = rule.mustExport.filter(
      name =>
        !record.symbols.some(symbol => symbol.name === name && symbol.defined),
    );
    if (missing.length) {
      failures++;
      console.error(
        `FAIL | symbols | ${abi.abi}/${rule.lib} | missing: ${missing.join(', ')}`,
      );
    } else {
      console.log(
        `PASS | symbols | ${abi.abi}/${rule.lib} | ${rule.mustExport.join(', ')}`,
      );
    }
  }
}

console.log(
  `Native library audit: ${files.length} files; ${failures} failure(s).`,
);
if (failures) process.exit(1);
