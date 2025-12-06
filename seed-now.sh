#!/bin/bash
# Quick script to seed the database

SERVICE_URL="https://khair-backend-autodeploy-1033808631898.europe-west1.run.app"

echo "🌱 Seeding database..."
echo "URL: $SERVICE_URL/api/seed"
echo ""

# Seed the database
RESPONSE=$(curl -s -X POST "$SERVICE_URL/api/seed")

echo "Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "success.*true"; then
  echo "✅ Database seeded successfully!"
  echo ""
  echo "🎉 Now visit: $SERVICE_URL"
  echo "   The hero slider and programs should now be visible!"
else
  echo "❌ Seeding failed. Check the response above."
fi






