#!/bin/bash
# Full admin flow test
echo "=== 1. Login POST ==="
RESP=$(curl -sk -D /tmp/h.txt -X POST https://glm2api.274747.xyz/admin/api/login \
  -H "Content-Type: application/json" \
  -d '{"key":"glm2api-admin"}')
echo "$RESP" | head -c 100
echo ""

echo "=== Headers ==="
grep -E "^HTTP|^set-cookie" /tmp/h.txt

COOKIE=$(grep -o 'glm2api_admin_session=[^;]*' /tmp/h.txt)
echo "Cookie: ${COOKIE:0:50}..."

echo ""
echo "=== 2. Overview with cookie ==="
curl -sk -H "Cookie: $COOKIE" https://glm2api.274747.xyz/admin/api/overview | head -c 200
echo ""

echo ""
echo "=== DONE ==="
