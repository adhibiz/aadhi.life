export const getResourceType = (file) => {
 const type = file.type.split('/')[0];
 if (type === 'image') return 'image';
 if (type === 'video') return 'video';
 return 'raw'; // For PDFs, documents, etc.
};

export const validateFileType = (file) => {
 const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
 const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']; // mp4, mov, avi
 const allowedDocTypes = [
 'application/pdf',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
 'text/plain'
 ];

 const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocTypes];

 if (!allAllowedTypes.includes(file.type)) {
 return { valid: false, error: 'Invalid file type.' };
 }

 return { valid: true, error: null };
};

export const validateFileSize = (file) => {
 const resourceType = getResourceType(file);
 const sizeInMB = file.size / (1024 * 1024);

 if (resourceType === 'image' && sizeInMB > 10) {
 return { valid: false, error: 'Image exceeds 10MB limit.' };
 }
 
 if (file.type === 'application/pdf' && sizeInMB > 20) {
 return { valid: false, error: 'PDF exceeds 20MB limit.' };
 }

 if (resourceType === 'raw' && sizeInMB > 20) {
 return { valid: false, error: 'Document exceeds 20MB limit.' };
 }

 if (resourceType === 'video' && sizeInMB > 100) {
 return { valid: false, error: 'Video exceeds 100MB limit.' };
 }

 return { valid: true, error: null };
};
