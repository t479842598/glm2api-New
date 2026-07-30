#!/bin/bash
cd /opt/glm2api

echo "=== Step 1: Login ==="
curl -s -X POST http://127.0.0.1:8001/admin/api/login \
  -H "Content-Type: application/json" \
  -d '{"key":"glm2api-admin"}' > /tmp/login.json

echo "Login response:"
head -c 200 /tmp/login.json
echo ""

echo "=== Step 2: Extract token ==="
TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/login.json')).get('data',{}).get('_session_token','MISSING'))")
echo "Token: ${TOKEN:0:60}..."

echo "=== Step 3: Test with x-admin-session header ==="
echo "Direct backend:"
curl -s -H "x-admin-session: $TOKEN" http://127.0.0.1:8001/admin/api/overview | head -c 200
echo ""

echo "Via nginx:"
curl -sk -H "x-admin-session: $TOKEN" https://glm2api.274747.xyz/admin/api/overview | head -c 200
echo ""

echo "=== DONE ==="
