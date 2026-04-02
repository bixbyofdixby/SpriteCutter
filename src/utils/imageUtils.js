export const getSlicedImageBlobs = (imageSrc, regions) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const results = [];
      
      for (const region of regions) {
        // Skip invalid regions
        if (region.width <= 0 || region.height <= 0) continue;

        canvas.width = region.width;
        canvas.height = region.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(
          img,
          region.x, region.y, region.width, region.height, // Source bounding box on original image
          0, 0, region.width, region.height // Destination coordinates on our cropped canvas
        );
        
        const dataUrl = canvas.toDataURL('image/png');
        results.push({ name: region.name, dataUrl, id: region.id });
      }
      resolve(results);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

export const dataUrlToBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
