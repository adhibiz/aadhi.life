import React from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { CLOUD_NAME } from '../../cloudinary/config';

// Initialize the Cloudinary instance once outside the component
const cld = new Cloudinary({ cloud: { cloudName: CLOUD_NAME } });

export const CloudinaryImage = ({ 
 publicId, 
 alt = "", 
 className = "",
 width,
 height,
 crop = true
}) => {
 if (!publicId) return null;

 // Retrieve the image by its public ID
 const img = cld.image(publicId)
 .format('auto')
 .quality('auto');
 
 // If dimensions are provided and crop is true, apply smart cropping
 if (width && height && crop) {
 img.resize(auto().gravity(autoGravity()).width(width).height(height));
 } else if (width) {
 img.resize(auto().width(width));
 } else if (height) {
 img.resize(auto().height(height));
 }

 return (
 <AdvancedImage 
  cldImg={img} 
  className={className} 
  alt={alt}
 />
 );
};
