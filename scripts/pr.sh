#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─── AI Message Generation ─────────────────────────────────────────────
# Supports Gemini (free!) and OpenAI. Set one of these env vars:
#   GEMINI_API_KEY  → uses Gemini 2.5 Flash (free tier, preferred)
#   OPENAI_API_KEY  → uses GPT-4o-mini (paid)
# Add to ~/.bashrc: export GEMINI_API_KEY="your-key"
# Get a free key at: https://aistudio.google.com/apikey
# ────────────────────────────────────────────────────────────────────────

generate_ai_gemini() {
  local diff="$1"
  local prompt="$2"
  local truncated_diff="${diff:0:8000}"

  local response
  response=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg system "$prompt" \
      --arg diff "$truncated_diff" \
      '{
        system_instruction: { parts: [{ text: $system }] },
        contents: [{ parts: [{ text: $diff }] }],
        generationConfig: { temperature: 0.3 }
      }'
    )" 2>/dev/null)

  echo "$response" | jq -r '.candidates[0].content.parts[0].text // empty' 2>/dev/null
}

generate_ai_openai() {
  local diff="$1"
  local prompt="$2"
  local truncated_diff="${diff:0:8000}"

  local response
  response=$(curl -s https://api.openai.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d "$(jq -n \
      --arg model "gpt-4o-mini" \
      --arg system "$prompt" \
      --arg diff "$truncated_diff" \
      '{
        model: $model,
        temperature: 0.3,
        messages: [
          { role: "system", content: $system },
          { role: "user", content: $diff }
        ]
      }'
    )" 2>/dev/null)

  echo "$response" | jq -r '.choices[0].message.content // empty' 2>/dev/null
}

generate_ai_message() {
  local diff="$1"
  local prompt="$2"

  if [[ "$AI_PROVIDER" == "gemini" ]]; then
    generate_ai_gemini "$diff" "$prompt"
  else
    generate_ai_openai "$diff" "$prompt"
  fi
}

generate_commit_message() {
  local diff="$1"
  generate_ai_message "$diff" \
    "You generate concise git commit messages following the Conventional Commits format (feat:, fix:, chore:, refactor:, docs:, style:, test:, ci:, perf:).
Rules:
- Output ONLY the commit message, nothing else
- First line: type(optional-scope): description (max 72 chars, lowercase)
- No body, no footer
- Be specific about what changed
Examples: 'feat(combobox): add keyboard navigation', 'chore: convert config files to typescript', 'fix(dialog): prevent focus trap escape'"
}

generate_pr_description() {
  local diff="$1"
  local title="$2"
  generate_ai_message "$diff" \
    "You generate concise GitHub PR descriptions in markdown. Given a git diff and a PR title, write a brief summary of changes.
Rules:
- Output ONLY the PR body (no title)
- Use a bullet list of key changes
- Keep it short (3-8 bullets max)
- Be specific and technical
- No fluff phrases like 'This PR...'"
}

# ─── Main Script ────────────────────────────────────────────────────────

# Ensure we're on a feature branch, not main
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" == "main" ]]; then
  echo -e "${RED}✗ You're on main. Create a feature branch first:${NC}"
  echo "  git checkout -b my-branch"
  exit 1
fi

# Ensure there are changes
if git diff --quiet && git diff --cached --quiet && [[ -z "$(git ls-files --others --exclude-standard)" ]]; then
  echo -e "${RED}✗ No changes detected. Make some changes first.${NC}"
  exit 1
fi

# Check if library source code was changed (needs version bump)
LIB_CHANGED=$(git diff --name-only HEAD -- 'packages/svelte/src/' 2>/dev/null || true)
UNTRACKED_LIB=$(git ls-files --others --exclude-standard -- 'packages/svelte/src/' 2>/dev/null || true)

HAS_AI=false
AI_PROVIDER=""
if command -v jq &>/dev/null; then
  if [[ -n "${GEMINI_API_KEY:-}" ]]; then
    HAS_AI=true
    AI_PROVIDER="gemini"
  elif [[ -n "${OPENAI_API_KEY:-}" ]]; then
    HAS_AI=true
    AI_PROVIDER="openai"
  fi
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Automated PR workflow${NC}"
if [[ "$HAS_AI" == true ]]; then
  echo -e "${BLUE}  ${CYAN}✦ AI-powered (${AI_PROVIDER})${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Format
echo -e "${YELLOW}→ Formatting...${NC}"
bun run format 2>/dev/null

# 2. Changeset
if [[ -n "$LIB_CHANGED" || -n "$UNTRACKED_LIB" ]]; then
  echo ""
  echo -e "${YELLOW}→ Library code changed — running changeset (pick bump type):${NC}"
  bunx changeset
else
  echo ""
  echo -e "${YELLOW}→ No library code changes — creating empty changeset${NC}"
  bunx changeset --empty
fi

# 3. Stage everything
git add -A

# 4. Get the diff for AI analysis (staged diff against HEAD)
DIFF=$(git diff --cached --stat && echo "---" && git diff --cached)

# 5. Generate commit message
if [[ -n "${1:-}" ]]; then
  # User provided explicit message
  COMMIT_MSG="$1"
elif [[ "$HAS_AI" == true ]]; then
  echo ""
  echo -e "${YELLOW}→ ${CYAN}✦ Generating commit message...${NC}"
  AI_MSG=$(generate_commit_message "$DIFF")

  if [[ -n "$AI_MSG" ]]; then
    echo -e "  ${GREEN}${AI_MSG}${NC}"
    echo ""
    read -r -p "  Use this message? [Y/n/e(dit)] " CONFIRM
    CONFIRM=${CONFIRM:-y}

    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
      COMMIT_MSG="$AI_MSG"
    elif [[ "$CONFIRM" =~ ^[Ee]$ ]]; then
      read -r -p "  Enter commit message: " COMMIT_MSG
    else
      COMMIT_MSG=$(echo "$BRANCH" | sed 's|/|: |' | sed 's|-| |g')
    fi
  else
    echo -e "  ${YELLOW}AI unavailable, using branch name${NC}"
    COMMIT_MSG=$(echo "$BRANCH" | sed 's|/|: |' | sed 's|-| |g')
  fi
else
  # No AI, no explicit message — use branch name
  COMMIT_MSG=$(echo "$BRANCH" | sed 's|/|: |' | sed 's|-| |g')
fi

echo ""
echo -e "${YELLOW}→ Committing: ${NC}${COMMIT_MSG}"
git commit -m "$COMMIT_MSG"

# 6. Push
echo ""
echo -e "${YELLOW}→ Pushing to origin/${BRANCH}...${NC}"
git push origin "$BRANCH" 2>/dev/null || git push --set-upstream origin "$BRANCH"

# 7. Create PR (if it doesn't already exist)
EXISTING_PR=$(gh pr view "$BRANCH" --json number 2>/dev/null | grep -o '"number":[0-9]*' | grep -o '[0-9]*' || true)

if [[ -n "$EXISTING_PR" ]]; then
  echo ""
  echo -e "${GREEN}✓ PR #${EXISTING_PR} already exists — pushed new changes${NC}"
  echo -e "  https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/pull/${EXISTING_PR}"
else
  # Generate PR description with AI
  PR_BODY=""
  if [[ "$HAS_AI" == true ]]; then
    echo ""
    echo -e "${YELLOW}→ ${CYAN}✦ Generating PR description...${NC}"
    PR_BODY=$(generate_pr_description "$DIFF" "$COMMIT_MSG")
  fi

  echo ""
  echo -e "${YELLOW}→ Creating PR...${NC}"
  if [[ -n "$PR_BODY" ]]; then
    PR_URL=$(gh pr create --base main --head "$BRANCH" --title "$COMMIT_MSG" --body "$PR_BODY" 2>&1)
  else
    PR_URL=$(gh pr create --base main --head "$BRANCH" --title "$COMMIT_MSG" --fill 2>&1)
  fi
  echo -e "${GREEN}✓ PR created: ${PR_URL}${NC}"
fi

echo ""
echo -e "${GREEN}✓ Done! Wait for CI to pass, then merge.${NC}"
