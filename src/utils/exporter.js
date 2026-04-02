import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getSlicedImageBlobs, dataUrlToBlob } from './imageUtils';

export const exportSlices = async (imageSrc, regions, exportMode, originalName) => {
  if (!regions || regions.length === 0) {
    throw new Error("No valid regions provided for slicing.");
  }

  const slices = await getSlicedImageBlobs(imageSrc, regions);
  
  if (slices.length === 0) {
    throw new Error("Slicing resulted in 0 output images. Please check your settings.");
  }

  if (exportMode === 'zip') {
    const zip = new JSZip();
    
    slices.forEach((slice) => {
      const blob = dataUrlToBlob(slice.dataUrl);
      // Ensure the name ends with .png
      const filename = slice.name.endsWith('.png') ? slice.name : `${slice.name}.png`;
      zip.file(filename, blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const baseName = originalName ? originalName.replace(/\.[^/.]+$/, "") : 'sprites';
    saveAs(zipBlob, `${baseName}_slices.zip`);
  } else {
    // Direct file download for each slice
    slices.forEach((slice) => {
      const blob = dataUrlToBlob(slice.dataUrl);
      const filename = slice.name.endsWith('.png') ? slice.name : `${slice.name}.png`;
      saveAs(blob, filename);
    });
  }
};
