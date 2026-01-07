const BACKEND_URI = process.env.NEXT_PUBLIC_API_URL || "https://messmanagement-net.onrender.com";
const MAX_FILE_SIZE_MB = 5;
const TARGET_SIZE_MB = 1;

const compressImage = async (file, targetSizeMB = TARGET_SIZE_MB) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.9;
        const targetSizeBytes = targetSizeMB * 1024 * 1024;
        
        const tryCompress = (q) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              if (blob.size <= targetSizeBytes || q <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                tryCompress(q - 0.1);
              }
            },
            'image/jpeg',
            q
          );
        };
        
        tryCompress(quality);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const uploadImageToBackend = async (file) => {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      throw new Error(`Image size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller image.`);
    }

    let fileToUpload = file;

    if (fileSizeMB > TARGET_SIZE_MB) {
      fileToUpload = await compressImage(file, TARGET_SIZE_MB);
      const compressedSizeMB = fileToUpload.size / (1024 * 1024);
      console.log(`Image compressed from ${fileSizeMB.toFixed(2)}MB to ${compressedSizeMB.toFixed(2)}MB`);
    }

    const formData = new FormData();
    formData.append("image", fileToUpload);

    const response = await fetch(`${BACKEND_URI}/api/admin/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to upload image");
    }

    return {
      success: true,
      data: {
        url: result.data.url,
        publicId: result.data.publicId,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to upload image",
    };
  }
};

export const deleteImageFromBackend = async (publicId) => {
  try {
    const response = await fetch(`${BACKEND_URI}/api/admin/upload`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete image");
    }

    return {
      success: true,
      message: result.message || "Image deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to delete image",
    };
  }
};

export const uploadMultipleImages = async (files, onProgress) => {
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadImageToBackend(file);

    if (result.success) {
      successCount++;
      results.push(result.data);
    } else {
      failCount++;
      results.push(null);
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        successCount,
        failCount,
      });
    }
  }

  return {
    success: failCount === 0,
    results,
    successCount,
    failCount,
  };
};
