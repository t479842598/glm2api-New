#!/bin/bash
echo "=== Test 1: Login POST ==="
curl -s -D /tmp/login_headers.txt -X POST https://glm2api.274747.xyz/admin/api/login -H "Content-Type: application/json" -d '{"key":"glm2api-admin"}' -o /tmp/login_body.txt 2>&1
echo "Status: $(head -1 /tmp/login_headers.txt | grep -o 'HTTP/[0-9.]* [0-9]*')"
grep -i set-cookie /tmp/login_headers.txt
echo ""

echo "=== Test 2: Extract cookie ==="
COOKIE=$(grep -o 'glm2api_admin_session=[^;]*' /tmp/login_headers.txt)
echo "Cookie: $COOKIE"
echo ""

echo "=== Test 3: Use cookie for overview ==="
curl -sk -H "Cookie: $COOKIE" https://glm2api.274747.xyz/admin/api/overview 2>&1 | head -c 200
echo ""
echo ""

echo "=== Test 4: Check if cookie is HttpOnly (browser stores it) ==="
echo "Cookie header is: $COOKIE"
echo "If curl -b with this cookie works, the issue is browser-side"
echo ""
echo "=== DONE ==="
