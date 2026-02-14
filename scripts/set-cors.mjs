/**
 * Script to set CORS on Firebase Storage bucket.
 * Run: node scripts/set-cors.mjs
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account key,
 * OR you can configure CORS manually via Google Cloud Console:
 *   1. Go to https://console.cloud.google.com/storage/browser
 *   2. Select your bucket: easypresskit.firebasestorage.app
 *   3. Click "Configuration" tab → Edit CORS
 *   4. Add the cors.json content
 */

// Since gsutil isn't available, here's how to do it from Google Cloud Console:
console.log(`
═══════════════════════════════════════════════════
  CONFIGURE CORS FOR FIREBASE STORAGE
═══════════════════════════════════════════════════

Since gsutil is not installed, configure CORS manually:

1. Open Google Cloud Console:
   https://console.cloud.google.com/storage/browser/easypresskit.firebasestorage.app

2. Log in with your Google account

3. Click on the bucket "easypresskit.firebasestorage.app"

4. Or use Cloud Shell (built into the console):
   - Click the "Activate Cloud Shell" button (terminal icon, top right)
   - Run this command:

   echo '[{"origin":["*"],"method":["GET","POST","PUT","DELETE","HEAD"],"maxAgeSeconds":3600}]' > /tmp/cors.json && gsutil cors set /tmp/cors.json gs://easypresskit.firebasestorage.app

5. Done! CORS will be configured immediately.
═══════════════════════════════════════════════════
`);
