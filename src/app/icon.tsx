import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  try {
    const filePath = path.join(process.cwd(), 'src/app/icon-base.jpg');
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid #C9A76A',
            background: '#050505',
          }}
        >
          <img
            src={base64Image}
            alt="Favicon"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    // Fallback if image reading fails
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 14,
            background: '#0B0B0B',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C9A76A',
            borderRadius: '50%',
            border: '1px solid #C9A76A',
            fontFamily: 'serif',
            fontWeight: 'bold',
          }}
        >
          N
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
