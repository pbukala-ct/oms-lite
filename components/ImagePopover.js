import React, { useState } from 'react';
import Image from 'next/image';

const ImagePopover = ({ src, alt }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative" 
         onMouseEnter={() => setIsHovered(true)} 
         onMouseLeave={() => setIsHovered(false)}>
      <div className="w-10 h-10">
        <Image
          src={src}
          alt={alt}
          width={40}
          height={40}
          objectFit="cover"
          className="rounded-full"
        />
      </div>
      {isHovered && (
        <div className="absolute z-50 shadow-lg rounded-lg overflow-hidden"
             style={{
               left: '100%',
               top: '0',
               marginLeft: '10px',
               width: '300px',
               height: '300px'
             }}>
          <Image
            src={src}
            alt={alt}
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}
    </div>
  );
};

export default ImagePopover;