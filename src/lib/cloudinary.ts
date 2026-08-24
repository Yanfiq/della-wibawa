import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(
  base64OrBuffer: string,
  folder = "smarta-umkm/receipts"
): Promise<string> {
  // If Cloudinary credentials are not configured, return the base64 as-is
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return base64OrBuffer;
  }

  try {
    const result = await cloudinary.uploader.upload(base64OrBuffer, {
      folder,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Graceful fallback to raw image data
    return base64OrBuffer;
  }
}

export { cloudinary };
