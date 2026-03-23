#!/bin/bash

# ============================================================
# Setya Abadi Elektronik — Server Health Check
# Usage: bash check.sh [SERVER_IP]
# ============================================================

SERVER=${1:-202.74.75.37}
API_PORT=8000
WEB_PORT=3000
NOTIF_PORT=3001

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }
section() { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${NC}"; }

check_http() {
  local label=$1 url=$2 expect=$3
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
  if [[ "$code" == "$expect" || ( "$expect" == "2xx" && "$code" =~ ^2 ) ]]; then
    ok "$label → HTTP $code"
  elif [[ "$code" == "000" ]]; then
    fail "$label → TIDAK BISA DIJANGKAU (timeout/refused)"
  else
    warn "$label → HTTP $code (expected $expect)"
  fi
}

echo -e "\n${BOLD}╔══════════════════════════════════════╗"
echo -e "║  Setya Abadi — Health Check v1.0    ║"
echo -e "╚══════════════════════════════════════╝${NC}"
echo -e "  Server : ${CYAN}$SERVER${NC}"
echo -e "  Time   : $(date '+%Y-%m-%d %H:%M:%S')"

# ── 1. Port Connectivity ──────────────────────────────────
section "Port Connectivity"
for port in $API_PORT $WEB_PORT $NOTIF_PORT 22; do
  result=$(timeout 3 bash -c "echo >/dev/tcp/$SERVER/$port" 2>&1 && echo "OPEN" || echo "CLOSED")
  if [[ "$result" == "OPEN" ]]; then
    ok "Port $port — OPEN"
  else
    fail "Port $port — CLOSED / FILTERED"
  fi
done

# ── 2. HTTP Endpoints ─────────────────────────────────────
section "HTTP Endpoints"
check_http "Web  (http://$SERVER:$WEB_PORT)" "http://$SERVER:$WEB_PORT" "2xx"
check_http "API  health                      " "http://$SERVER:$API_PORT/api/health" "200"
check_http "API  ping (root)                 " "http://$SERVER:$API_PORT" "200"
check_http "Notif service                    " "http://$SERVER:$NOTIF_PORT" "2xx"

# ── 3. API Functional Checks ─────────────────────────────
section "API Functional Checks"
# Login endpoint (expect 422 = validation error = endpoint exists)
code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 \
  -X POST "http://$SERVER:$API_PORT/api/auth/login" \
  -H "Content-Type: application/json" -d '{}' 2>/dev/null)
[[ "$code" == "422" || "$code" == "401" || "$code" == "200" ]] \
  && ok "POST /api/auth/login reachable (HTTP $code)" \
  || fail "POST /api/auth/login → HTTP $code"

# ── 4. Response Time ─────────────────────────────────────
section "Response Time"
for label_url in \
  "Web|http://$SERVER:$WEB_PORT" \
  "API|http://$SERVER:$API_PORT/api/health"; do
  label="${label_url%%|*}"
  url="${label_url##*|}"
  ms=$(curl -s -o /dev/null -w "%{time_total}" --connect-timeout 5 "$url" 2>/dev/null)
  ms_int=$(echo "$ms * 1000" | bc 2>/dev/null | cut -d. -f1)
  if [[ -z "$ms_int" || "$ms_int" -eq 0 ]]; then
    warn "$label — tidak dapat diukur"
  elif [[ "$ms_int" -lt 500 ]]; then
    ok "$label — ${ms_int}ms"
  elif [[ "$ms_int" -lt 2000 ]]; then
    warn "$label — ${ms_int}ms (lambat)"
  else
    fail "$label — ${ms_int}ms (sangat lambat)"
  fi
done

# ── 5. VITE_API_URL Check ────────────────────────────────
section "Frontend Config Check"
html=$(curl -s --connect-timeout 5 "http://$SERVER:$WEB_PORT" 2>/dev/null)
if echo "$html" | grep -q "hilang\|boilerplate\|source code"; then
  fail "Web masih menampilkan boilerplate — rebuild diperlukan!"
  warn "Jalankan: docker compose build --no-cache web && docker compose up -d web"
elif echo "$html" | grep -q "Setya\|react\|vite"; then
  ok "Web menampilkan konten yang benar"
else
  warn "Web merespons tapi konten tidak dikenali"
fi

# Check if API URL is baked in correctly
if echo "$html" | grep -q "$SERVER:$API_PORT"; then
  ok "VITE_API_URL sudah mengarah ke server ($SERVER:$API_PORT)"
elif echo "$html" | grep -q "localhost"; then
  fail "VITE_API_URL masih mengarah ke localhost! Rebuild web dengan VITE_API_URL yang benar"
fi

# ── Summary ──────────────────────────────────────────────
echo -e "\n${BOLD}${CYAN}═══ Summary ═══${NC}"
echo -e "  Akses: http://$SERVER:$WEB_PORT  (web)"
echo -e "         http://$SERVER:$API_PORT  (api)"
echo -e "         http://$SERVER:$NOTIF_PORT (notification)"
echo ""
