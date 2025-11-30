#!/bin/bash

echo "=============================================="
echo "Force Fresh Deployment to Cloud Run"
echo "=============================================="
echo ""

echo "Step 1: Committing any remaining changes..."
git add .
git commit -m "Force fresh deployment - build verified locally" || echo "Nothing to commit"

echo ""
echo "Step 2: Pushing to trigger deployment..."
git push

echo ""
echo "Step 3: Waiting for deployment..."
echo "Check status at: https://console.cloud.google.com/run/detail/europe-west1/khair-backend-autodeploy"
echo ""
echo "Once deployed, test at:"
echo "  - Check env: https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/api/check-env"
echo "  - Upload: https://khair-backend-autodeploy-1033808631898.europe-west1.run.app/admin"
echo ""
echo "=============================================="
