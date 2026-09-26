import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
const filePath = process.argv[2];

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('One or more CLOUDINARY_* values are missing from backend/.env');
}
if (!filePath) {
  throw new Error('Pass a test image path as the first argument.');
}

const bytes = await readFile(filePath);
const form = new FormData();

form.append('file', new Blob([bytes]), path.basename(filePath));
form.append('folder', 'hostel-management/diagnostic');

const credentials = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString(
  'base64'
);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
  {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}` },
    body: form,
  }
);

console.log('HTTP status:', response.status);
console.log('X-Cld-Error:', response.headers.get('x-cld-error'));
console.log('Response body:', await response.text());
