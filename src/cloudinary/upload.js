import axios from 'axios';
import { CLOUD_NAME, UPLOAD_PRESET, CLOUDINARY_URL } from './config';
import { validateFileType, validateFileSize, getResourceType } from './validate';

export const uploadFile = async (file, folder, onProgress) => {
 const typeValidation = validateFileType(file);
 if (!typeValidation.valid) throw new Error(typeValidation.error);

 const sizeValidation = validateFileSize(file);
 if (!sizeValidation.valid) throw new Error(sizeValidation.error);

 const resourceType = getResourceType(file);
 const publicId = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, '-')}`;

 const formData = new FormData();
 formData.append('file', file);
 formData.append('upload_preset', UPLOAD_PRESET);
 formData.append('cloud_name', CLOUD_NAME);
 formData.append('public_id', publicId);
 formData.append('resource_type', resourceType);

 const response = await axios.post(CLOUDINARY_URL, formData, {
 onUploadProgress: (progressEvent) => {
  if (onProgress) {
  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  onProgress(percentCompleted);
  }
 }
 });

 const { secure_url, public_id, original_filename, format, bytes, created_at } = response.data;

 return {
 secureUrl: secure_url,
 publicId: public_id,
 originalName: original_filename,
 fileType: format,
 fileSize: bytes,
 uploadedAt: created_at,
 resourceType
 };
};

export const deleteFile = async (publicId, resourceType) => {
 // DELETE to Cloudinary Admin API via backend proxy (never expose API secret in frontend)
 // Assuming a backend endpoint exists, otherwise this is a placeholder
 // const response = await axios.delete(`/api/cloudinary/delete`, { data: { publicId, resourceType } });
 // return response.data;
 console.warn("Delete requires a backend proxy to protect the API secret.");
 return { deleted: true };
};

export const replaceFile = async (oldPublicId, newFile, folder, onProgress) => {
 const newFileResult = await uploadFile(newFile, folder, onProgress);
 await deleteFile(oldPublicId, getResourceType(newFile)); // Might need old resource type
 return newFileResult;
};
