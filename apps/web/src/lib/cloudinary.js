export async function uploadFileToCloudinary(file, options = {}) {
  const {
    folder = 'capstone/uploads',
    allowedTypes = [],
    maxSizeBytes = 5 * 1024 * 1024,
  } = options;

  if (!file) {
    throw new Error('No file selected.');
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type.');
  }

  if (file.size > maxSizeBytes) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Add keys to .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed. Please try again.');
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    originalName: file.name,
  };
}
