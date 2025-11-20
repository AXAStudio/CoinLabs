import fs from 'fs';
import path from 'path';

// Safely produce a frontend/.env that only contains client-safe variables
// (by default we allow keys starting with VITE_). This prevents server-only
// secrets (like SUPABASE_SERVICE_ROLE_KEY) from being written into the frontend
// bundle by accident.
//
// On Render (and other hosting), this script may not find a .env file because
// env vars are provided via the hosting platform's dashboard. In that case,
// we just warn and continue — Vite will use import.meta.env which is populated
// by the build environment.

// Try to find repo root (.env is typically at repo root, not in frontend/)
// Walk up the directory tree looking for .env
let repoRoot = process.cwd();
let foundEnv = false;
for (let i = 0; i < 5; i++) {
  const potentialEnv = path.join(repoRoot, '.env');
  if (fs.existsSync(potentialEnv)) {
    foundEnv = true;
    break;
  }
  repoRoot = path.resolve(repoRoot, '..');
  // Stop if we reach filesystem root
  if (repoRoot === path.resolve(repoRoot, '..')) break;
}

const rootEnv = path.join(repoRoot, '.env');
const targetEnv = path.join(process.cwd(), '.env');

// Allowlist: keys that are safe to expose to the frontend
const isAllowedKey = (key) => key.startsWith('VITE_');

function parseDotenv(content) {
  const lines = content.split(/\r?\n/);
  const entries = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.substring(0, eq).trim();
    let value = line.substring(eq + 1).trim();
    // strip optional surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    entries.push({ key, value });
  }
  return entries;
}

try {
  if (foundEnv && fs.existsSync(rootEnv)) {
    const data = fs.readFileSync(rootEnv, { encoding: 'utf8' });
    const parsed = parseDotenv(data);

    // Filter to allowed keys and recompose .env content
    const filtered = parsed.filter(({ key }) => isAllowedKey(key));
    if (filtered.length === 0) {
      console.warn('No frontend-safe variables found in repo .env (no VITE_ keys)');
    }

    const out = filtered.map(({ key, value }) => `${key}=${value}`).join('\n') + (filtered.length ? '\n' : '');

    // Only write if different to avoid touching mtime unnecessarily
    let write = true;
    if (fs.existsSync(targetEnv)) {
      const existing = fs.readFileSync(targetEnv, { encoding: 'utf8' });
      if (existing === out) write = false;
    }
    if (write) {
      fs.writeFileSync(targetEnv, out, { encoding: 'utf8' });
      console.log('Wrote frontend-safe variables to frontend/.env');
    }
  } else {
    // No .env file found — this is normal on Render where env vars come from the dashboard
    console.log('No .env file found (normal on hosted platforms). Using environment variables from build system.');
  }
} catch (err) {
  console.error('Warning: Failed to prepare frontend/.env:', err.message);
  // Don't exit with error — build can continue, Vite will use platform env vars
}

