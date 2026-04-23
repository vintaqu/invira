import { v2 as cloudinaryV2 } from 'cloudinary'

const configured = !!(
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'placeholder' &&
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder'
)

if (configured) {
  cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:    process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  })
}

export const cloudinary = cloudinaryV2
export const cloudinaryConfigured = configured

export async function uploadImage(file: string, folder = 'invitely/events') {
  if (!configured) {
    throw new Error('[DEV MODE] Cloudinary not configured. Add CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_SECRET to .env.local')
  }
  const result = await cloudinaryV2.uploader.upload(file, {
    folder,
    resource_type: 'auto',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  })
  return {
    url:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
  }
}

export async function deleteImage(publicId: string) {
  if (!configured) return
  return cloudinaryV2.uploader.destroy(publicId)
}
