import fs from 'fs';
import path from 'path';

// Safely produce a frontend/.env that only contains client-safe variables
// (by default we allow keys starting with VITE_). This prevents server-only
// secrets (like SUPABASE_SERVICE_ROLE_KEY) from being written into the frontend
// bundle by accident.
const repoRoot = path.resolve(process.cwd(), '..'); // frontend/ -> repo root is parent
const rootEnv = path.join(repoRoot, '.env');
const targetEnv = path.join(process.cwd(), '.env');

// Allowlist: keys that are safe to expose to the frontend. By default we pick
// VITE_ prefixed variables. You can add other safe keys here if needed.
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
  if (fs.existsSync(rootEnv)) {
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
    console.warn('No .env found at repo root:', rootEnv);
  }
} catch (err) {
  console.error('Failed to prepare frontend/.env from repo .env:', err);
  process.exit(1);
}
