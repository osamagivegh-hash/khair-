# Build Troubleshooting Guide

## Error: "no such file or directory" for Dockerfile

If you see this error, it means Cloud Build can't find the Dockerfile. Here are solutions:

### Solution 1: Use explicit Dockerfile path (Recommended)

Make sure you're using the updated `cloudbuild.yaml` which includes `-f Dockerfile`:

```yaml
args:
  - 'build'
  - '-f'
  - 'Dockerfile'
  - '-t'
  - 'gcr.io/$PROJECT_ID/al-khair:latest'
  - '.'
```

### Solution 2: Build directly with gcloud (Alternative)

Instead of using `cloudbuild.yaml`, build directly:

```bash
# Make sure you're in the project root directory
cd /path/to/al-khair

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/al-khair
```

### Solution 3: Check build context

Ensure you're submitting from the project root:

```bash
# Verify Dockerfile exists
ls -la Dockerfile

# Submit from project root
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/al-khair .
```

### Solution 4: Use Cloud Build with explicit config

```bash
gcloud builds submit --config=cloudbuild.yaml .
```

Note the `.` at the end - this specifies the build context (current directory).

---

## Common Issues

### Issue: Dockerfile not found
**Fix**: Ensure you're in the project root and Dockerfile exists

### Issue: Build context wrong
**Fix**: Always include `.` at the end of `gcloud builds submit` command

### Issue: Files missing in build
**Check**: Review `.dockerignore` to ensure required files aren't excluded

---

## Quick Build Commands

```bash
# Method 1: Direct build (simplest)
gcloud builds submit --tag gcr.io/PROJECT_ID/al-khair .

# Method 2: Using cloudbuild.yaml
gcloud builds submit --config=cloudbuild.yaml .

# Method 3: Using deploy script
./deploy.sh PROJECT_ID us-central1 al-khair
```






