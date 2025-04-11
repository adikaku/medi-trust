import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const runOCR = (imageName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pyPath = path.resolve(__dirname, '../../ocr/main.py');
    const uploadPath = path.resolve(__dirname, '../../uploads'); // ✅ Upload folder
    const absImagePath = path.join(uploadPath, imageName); // ✅ Full path to uploaded image

    if (!fs.existsSync(absImagePath)) {
      console.error('[OCR ERROR] Image file not found at:', absImagePath);
      return reject(new Error('Image file not found before running OCR'));
    }
    console.log(absImagePath)
    const python = spawn('python', [pyPath, absImagePath]);

    let data = '';

    python.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on('data', (err) => {
      console.error('Python Error:', err.toString());
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const lines = data.trim().split('\n');
          const jsonLine = lines.find(line => {
            try {
              JSON.parse(line);
              return true;
            } catch {
              return false;
            }
          });

          if (!jsonLine) {
            console.error('[OCR ERROR] No valid JSON found in OCR output:', data);
            return reject(new Error("Invalid OCR output"));
          }

          const parsed = JSON.parse(jsonLine);
          
          // Added this section to print the OCR result to the backend terminal
          console.log('[OCR SUCCESS] OCR Result:');
          console.log(JSON.stringify(parsed, null, 2)); // Pretty print the JSON
          
          resolve(parsed);
        } catch (e) {
          console.error('[OCR ERROR] Failed to parse OCR output:', data);
          reject(new Error("Invalid OCR output"));
        }
      } else {
        reject(new Error('OCR process failed'));
      }
    });
  });
};