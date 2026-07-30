#!/bin/bash
# Test complete admin flow from local machine

echo "=== Step 1: Login ==="
curl -sk -D /tmp/h.txt -X POST https://glm2api.274747.xyz/admin/api/login \
  -H "Content-Type: application/json" \
  -d '{"key":"glm2api-admin"}' -o /tmp/body.json 2>&1

echo "HTTP Status:"
grep "^HTTP" /tmp/h.txt
echo "Set-Cookie:"
grep -i set-cookie /tmp/h.txt
echo "Response body (first 100 chars):"
head -c 100 /tmp/body.json
echo ""

echo ""
echo "=== Step 2: Use cookie ==="
COOKIE=$(grep -o 'glm2api_admin_session=[^;]*' /tmp/h.txt)
echo "Cookie: $COOKIE"

echo ""
echo "=== Step 3: Test overview with cookie ==="
curl -sk -H "Cookie: $COOKIE" https://glm2api.274747.xyz/admin/api/overview 2>&1 | head -c 300
echo ""

echo ""
echo "=== Step 4: Test session endpoint ==="
curl -sk https://glm2api.274747.xyz/admin/api/session -H "Cookie: $COOKIE" 2>&1
