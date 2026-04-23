import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1c18', borderRadius: 8 }}>
        <svg width="22" height="22" viewBox="0 0 110 110" fill="none">
          <path d="M55 100C55 100 8 62 8 35C8 16 23 3 40 3C47 3 53 7 55 9C57 7 63 3 70 3C87 3 102 16 102 35C102 62 55 100 55 100Z" fill="#84C5BC"/>
          <circle cx="72" cy="22" r="10" fill="white" opacity="0.95"/>
          <circle cx="78" cy="15" r="5.5" fill="white"/>
        </svg>
      </div>
    ),
    { ...size }
  )
}
