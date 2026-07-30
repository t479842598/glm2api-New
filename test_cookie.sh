#!/bin/bash
# Test on server
echo "=== Login ==="
SESH=$(curl -s -D - -X POST http://127.0.0.1:8001/admin/api/login -H "Content-Type: application/json" -d '{"key":"glm2api-admin"}' 2>&1 | grep -o 'glm2api_admin_session=[^;]*')
echo "Cookie: $SESH"

echo "=== Overview with cookie ==="
curl -s -H "Cookie: $SESH" http://127.0.0.1:8001/admin/api/overview 2>&1 | head -c 300

echo ""
echo "=== Test via nginx ==="
curl -sk -D - -X POST https://127.0.0.1:8001/admin/api/login -H "Content-Type: application/json" -d '{"key":"glm2api-admin"}' 2>&1 | grep -i set-cookie

echo "=== DONE ==="
