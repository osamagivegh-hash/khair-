/**
 * Cloud Function to sync SQLite database from Cloud Storage to Cloud Run
 * Deploy this as a Cloud Function and trigger it before Cloud Run starts
 * 
 * Usage:
 * gcloud functions deploy syncDatabase \
 *   --runtime nodejs20 \
 *   --trigger-http \
 *   --allow-unauthenticated \
 *   --set-env-vars BUCKET_NAME=PROJECT_ID-sqlite-db
 */

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

exports.syncDatabase = async (req, res) => {
  const bucketName = process.env.BUCKET_NAME || `${process.env.GCLOUD_PROJECT}-sqlite-db`;
  const bucket = storage.bucket(bucketName);
  const fileName = 'dev.db';

  try {
    // Check if file exists
    const [exists] = await bucket.file(fileName).exists();
    
    if (exists) {
      console.log(`Database file ${fileName} exists in bucket ${bucketName}`);
      res.status(200).json({
        success: true,
        message: `Database file ${fileName} is available in bucket ${bucketName}`,
        bucket: bucketName,
        file: fileName,
      });
    } else {
      console.log(`Database file ${fileName} not found in bucket ${bucketName}`);
      res.status(404).json({
        success: false,
        message: `Database file ${fileName} not found in bucket ${bucketName}`,
        bucket: bucketName,
        file: fileName,
      });
    }
  } catch (error) {
    console.error('Error checking database:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};






