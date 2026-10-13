#!/usr/bin/env bash
# Hook PostToolUse — format file yang baru diedit/ditulis dengan Prettier.
#
# Input: JSON event pada stdin (dari Claude Code), bukan env var.
# Format: prettier --write <file>   (tanpa quotes agar aman di Windows/MSYS)
set -euo pipefail

input="$(cat)"
file_path="$(printf '%s' "$input" | node -e "
  let s = '';
  process.stdin.on('data', (c) => (s += c));
  process.stdin.on('end', () => {
    try { const j = JSON.parse(s); process.stdout.write(j.tool_input?.file_path || ''); }
    catch { process.exit(0); }
  });
")"

# Abaikan file yang tidak didukung Prettier / bukan target kita.
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css|*.html|*.yml|*.yaml) ;;
  *) exit 0 ;;
esac

# Abaikan file yang dilindungi: .env, lockfile, dan file yang di-ignore Prettier.
case "$file_path" in
  *.env*|package-lock.json|pnpm-lock.yaml|yarn.lock|dist/*|node_modules/*) exit 0 ;;
esac

npx prettier --write "$file_path" >/dev/null 2>&1 || exit 0
