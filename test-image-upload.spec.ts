import { test, expect } from '@playwright/test';
import path from 'path';

test('test image upload functionality', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173');
  
  // Wait for the page to load
  await page.waitForSelector('text=Generate Design');
  
  // Click on the image upload button
  const imageButton = page.locator('button[title="Upload reference image"]').first();
  await expect(imageButton).toBeVisible();
  
  // Set up file chooser listener before clicking
  const fileChooserPromise = page.waitForEvent('filechooser');
  await imageButton.click();
  
  const fileChooser = await fileChooserPromise;
  
  // Use a test image
  const imagePath = path.join(__dirname, 'src/assets/motive_default.png');
  await fileChooser.setFiles(imagePath);
  
  // Wait a bit for image processing
  await page.waitForTimeout(2000);
  
  // Check if image preview appears
  const imagePreview = page.locator('img[alt="Reference"]').first();
  await expect(imagePreview).toBeVisible();
  
  // Check console for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  
  // Take a screenshot
  await page.screenshot({ path: 'image-upload-test.png', fullPage: true });
  
  console.log('Test completed');
});