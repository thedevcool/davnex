// Cloudinary configuration and upload utility

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  uploadPreset:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "davnex_products",
};

// Check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!(
    cloudinaryConfig.cloudName &&
    cloudinaryConfig.cloudName !== "your_cloud_name_here" &&
    cloudinaryConfig.uploadPreset
  );
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Please add your credentials to .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset!);
  formData.append("folder", "davnex/products");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

// Delete image from Cloudinary (optional - requires server-side API)
export const getCloudinaryPublicId = (url: string): string | null => {
  try {
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch {
    return null;
  }
};
