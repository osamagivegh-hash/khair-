# Quick script to check Cloud Run logs for upload errors
# Usage: bash check-logs.sh

echo "==================================="
echo "Checking Cloud Run Logs for al-khair"
echo "==================================="
echo ""

echo "1. Checking environment variables..."
echo "-----------------------------------"
gcloud run services describe al-khair --region=us-central1 --format="value(spec.template.spec.containers[0].env)" 2>/dev/null || echo "Failed to fetch env vars. Make sure you're logged in with: gcloud auth login"
echo ""

echo "2. Recent logs (last 50 lines)..."
echo "-----------------------------------"
gcloud run services logs read al-khair --region=us-central1 --limit=50 2>/dev/null || echo "Failed to fetch logs. Make sure you're logged in with: gcloud auth login"
echo ""

echo "3. Filtering for Cloudinary-related logs..."
echo "-----------------------------------"
gcloud run services logs read al-khair --region=us-central1 --limit=100 2>/dev/null | grep -i "cloudinary\|upload" || echo "No Cloudinary/upload logs found"
echo ""

echo "4. Filtering for errors..."
echo "-----------------------------------"
gcloud run services logs read al-khair --region=us-central1 --limit=100 2>/dev/null | grep -i "error\|failed" || echo "No error logs found"
echo ""

echo "==================================="
echo "To follow logs in real-time, run:"
echo "gcloud run services logs tail al-khair --region=us-central1"
echo "==================================="
