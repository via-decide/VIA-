#!/bin/bash

# .claude/hooks/post-deploy.sh — VIA Post-Deployment Smoke Test
# Usage: ./post-deploy.sh

SITE_URL="https://www.viadecide.com"
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_ANON_KEY="YOUR_ANON_KEY"
FIREBASE_DB_URL="https://viadecide-default-rtdb.firebaseio.com"

# Helpers
log() {
  echo "[$(date +'%H:%M:%S')] $1"
}

summary_check=()
summary_status=()
summary_severity=()

add_to_summary() {
  summary_check+=("$1")
  summary_status+=("$2")
  summary_severity+=("$3")
}

P0_COUNT=0

# 1. SMOKE TEST MESH
log "Starting smoke test for $SITE_URL..."

# Main Route
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
if [ "$CODE" -eq 200 ]; then
  add_to_summary "Main Route (200)" "PASS" "INFO"
else
  add_to_summary "Main Route ($CODE)" "FAIL" "P0"
  P0_COUNT=$((P0_COUNT + 1))
fi

# SPA Rewrite Route
CODE_SPA=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/via-test-route")
if [ "$CODE_SPA" -eq 200 ]; then
  add_to_summary "SPA Rewrite (200)" "PASS" "INFO"
else
  add_to_summary "SPA Rewrite ($CODE_SPA)" "FAIL" "P0"
  P0_COUNT=$((P0_COUNT + 1))
fi

# 2. CHECK FEED
log "Checking feed hydration state..."
FEED_BODY=$(curl -sL "$SITE_URL")
WAITING_COUNT=$(echo "$FEED_BODY" | grep -c "Loading...")
if [ "$WAITING_COUNT" -gt 5 ]; then
  add_to_summary "Feed Hydration" "WARN" "P1"
  log "WARNING: Feed card might be stuck on 'Loading...'"
else
  add_to_summary "Feed Hydration" "PASS" "INFO"
fi

# 3. CHECK EXTERNAL LINKS
log "Auditing external links for safety..."
UNGUARDED_LINKS=$(echo "$FEED_BODY" | grep -oE 'href="https?://[^"]+"' | grep -v 'target="_blank"')
if [ -n "$UNGUARDED_LINKS" ]; then
  add_to_summary "External Links" "WARN" "P1"
  log "WARNING: Found unguarded external links: $UNGUARDED_LINKS"
else
  add_to_summary "External Links" "PASS" "INFO"
fi

# 4. CHECK TOOLS TAB
log "Verifying tools registry reachability..."
NO_TOOLS=$(echo "$FEED_BODY" | grep -c "No tools found")
if [ "$NO_TOOLS" -gt 0 ]; then
  add_to_summary "Tools Registry" "FAIL" "P0"
  log "ERROR: Tools registry reporting 'No tools found'"
  P0_COUNT=$((P0_COUNT + 1))
else
  add_to_summary "Tools Registry" "PASS" "INFO"
fi

# 5. SUPABASE CONNECTIVITY
log "Testing Supabase REST endpoint..."
SUPA_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/")
if [ "$SUPA_CODE" -eq 200 ] || [ "$SUPA_CODE" -eq 204 ]; then
  add_to_summary "Supabase Connectivity" "PASS" "INFO"
else
  add_to_summary "Supabase Connectivity ($SUPA_CODE)" "FAIL" "P0"
  log "ERROR: Supabase unreachable"
  P0_COUNT=$((P0_COUNT + 1))
fi

# 6. FIREBASE REACHABILITY
log "Testing Firebase RTDB reachability..."
FB_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_DB_URL/.json?shallow=true")
if [ "$FB_CODE" -eq 200 ] || [ "$FB_CODE" -eq 401 ] || [ "$FB_CODE" -eq 403 ]; then
  add_to_summary "Firebase Reachability" "PASS" "INFO"
else
  add_to_summary "Firebase Reachability ($FB_CODE)" "FAIL" "P0"
  log "ERROR: Firebase timed out or unreachable"
  P0_COUNT=$((P0_COUNT + 1))
fi

# 7. FINAL REPORT
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " CHECK                       | STATUS | SEVERITY "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for i in "${!summary_check[@]}"; do
  printf " %-27s | %-6s | %-8s \n" "${summary_check[$i]}" "${summary_status[$i]}" "${summary_severity[$i]}"
done
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$P0_COUNT" -gt 0 ]; then
  log "DEPLOYMENT FAILED: $P0_COUNT P0 errors found."
  exit 1
else
  log "DEPLOYMENT SUCCESSFUL."
  exit 0
fi
