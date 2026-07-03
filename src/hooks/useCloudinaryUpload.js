import { useState, useCallback } from 'react';
import { uploadFile } from '../cloudinary/upload';

export const useCloudinaryUpload = () => {
 const [isUploading, setIsUploading] = useState(false);
 const [progress, setProgress] = useState(0);
 const [error, setError] = useState(null);
 const [result, setResult] = useState(null);

 const upload = useCallback(async (file, folder) => {
 setIsUploading(true);
 setProgress(0);
 setError(null);
 setResult(null);

 try {
  const res = await uploadFile(file, folder, (p) => setProgress(p));
  setResult(res);
  return res;
 } catch (err) {
  setError(err.message || 'Upload failed');
  throw err;
 } finally {
  setIsUploading(false);
 }
 }, []);

 const reset = useCallback(() => {
 setIsUploading(false);
 setProgress(0);
 setError(null);
 setResult(null);
 }, []);

 return { upload, isUploading, progress, error, result, reset };
};
