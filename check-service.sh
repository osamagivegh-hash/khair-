#!/bin/bash
# Quick service health check script

SERVICE_NAME="${1:-al-khair}"
REGION="${2:-us-central1}"

echo "🔍 Checking Cloud Run Service: $SERVICE_NAME"
echo "📍 Region: $REGION"
echo ""

# Check service status
echo "📊 Service Status:"
gcloud run services describe $SERVICE_NAME --region $REGION \
  --format="value(status.conditions)" 2>/dev/null || {
  echo "❌ Service not found or error accessing it"
  exit 1
}

echo ""
echo "🌐 Service URL:"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)' 2>/dev/null)

if [ -z "$SERVICE_URL" ]; then
  echo "❌ Could not get service URL"
  exit 1
fi

echo "$SERVICE_URL"
echo ""

# Check environment variables
echo "⚙️  Environment Variables:"
gcloud run services describe $SERVICE_NAME --region $REGION \
  --format="value(spec.template.spec.containers[0].env)" 2>/dev/null | grep -E "(PORT|DATABASE_URL|NODE_ENV)" || echo "No env vars found"
echo ""

# Test health endpoint
echo "🏥 Testing Health Endpoint:"
HEALTH_URL="${SERVICE_URL}/api/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL" 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Health check passed (HTTP $HTTP_CODE)"
  curl -s "$HEALTH_URL" | head -c 200
  echo ""
elif [ "$HTTP_CODE" = "503" ]; then
  echo "⚠️  Health check returned 503 (Service Unavailable)"
  echo "Response:"
  curl -s "$HEALTH_URL" | head -c 500
  echo ""
elif [ "$HTTP_CODE" = "000" ]; then
  echo "❌ Could not connect to service (timeout or connection refused)"
else
  echo "⚠️  Health check returned HTTP $HTTP_CODE"
  curl -s "$HEALTH_URL" | head -c 500
  echo ""
fi

echo ""
echo "📋 Recent Logs (last 20 lines):"
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 20 2>/dev/null || echo "Could not fetch logs"

echo ""
echo "💡 To view full logs:"
echo "   gcloud run services logs read $SERVICE_NAME --region $REGION --limit 100"

