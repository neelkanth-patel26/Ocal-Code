import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const compilerDir = path.join(rootDir, 'compiler');
const compilerBin = path.join(compilerDir, 'bin');

console.log('>>> [Ocal++ Toolchain Provisioner] Ensuring GCC toolchain is bundled for packaging...');

if (!fs.existsSync(compilerBin)) {
  fs.mkdirSync(compilerBin, { recursive: true });
}

const gxxPath = path.join(compilerBin, 'g++.exe');

if (fs.existsSync(gxxPath)) {
  console.log('✔ Bundled GCC toolchain is already present at:', compilerBin);
  process.exit(0);
}

// Check local MSYS2 / MinGW to populate bundled compiler
const localMsysCandidates = [
  'C:\\msys64\\ucrt64',
  'C:\\msys64\\mingw64',
  'C:\\TDM-GCC-64',
  'C:\\MinGW',
];

let foundSource = null;
for (const cand of localMsysCandidates) {
  if (fs.existsSync(path.join(cand, 'bin', 'g++.exe'))) {
    foundSource = cand;
    break;
  }
}

if (foundSource) {
  console.log(`>>> Detected local GCC toolchain at "${foundSource}". Preparing bundled distribution...`);

  // Essential binaries and runtime DLLs to copy
  const sourceBin = path.join(foundSource, 'bin');
  const filesToCopy = [
    'g++.exe',
    'gcc.exe',
    'as.exe',
    'ld.exe',
    'ar.exe',
    'nm.exe',
    'strip.exe',
    'objdump.exe',
    'cc1plus.exe',
    'cc1.exe',
    'libstdc++-6.dll',
    'libgcc_s_seh-1.dll',
    'libwinpthread-1.dll',
    'zlib1.dll',
    'libgmp-10.dll',
    'libmpfr-6.dll',
    'libmpc-3.dll',
    'libisl-23.dll',
    'libiconv-2.dll',
    'libintl-8.dll',
  ];

  try {
    const binFiles = fs.readdirSync(sourceBin);
    for (const f of binFiles) {
      const lower = f.toLowerCase();
      if (
        filesToCopy.includes(lower) ||
        lower.endsWith('.dll') ||
        lower === 'g++.exe' ||
        lower === 'gcc.exe'
      ) {
        const srcFile = path.join(sourceBin, f);
        const dstFile = path.join(compilerBin, f);
        try {
          fs.copyFileSync(srcFile, dstFile);
        } catch {}
      }
    }

    // Also copy include and lib/gcc folders if present
    const dirsToCopy = ['include', 'lib'];
    for (const d of dirsToCopy) {
      const srcD = path.join(foundSource, d);
      const dstD = path.join(compilerDir, d);
      if (fs.existsSync(srcD) && !fs.existsSync(dstD)) {
        try {
          fs.cpSync(srcD, dstD, { recursive: true });
        } catch {}
      }
    }

    console.log('✔ Successfully created bundled compiler distribution at:', compilerDir);
  } catch (err) {
    console.warn('Warning during compiler bundling:', err.message);
  }
} else {
  console.log('ℹ No local MSYS2 installation found to clone. Toolchain will use system PATH or download on first run.');
}
