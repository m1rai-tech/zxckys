/**
 * Resizes and compresses an image file using an off-screen canvas.
 * Always outputs JPEG regardless of input format (PNG, WEBP, HEIC, etc.).
 *
 * @param {File|Blob} file
 * @param {object}  opts
 * @param {number}  opts.maxWidth   - longest allowed width  (default 1920)
 * @param {number}  opts.maxHeight  - longest allowed height (default 1920)
 * @param {number}  opts.quality    - JPEG quality 0–1       (default 0.82)
 * @returns {Promise<Blob>}
 */
export function compressImage(file, { maxWidth = 1920, maxHeight = 1920, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { naturalWidth: w, naturalHeight: h } = img;

      // Scale down proportionally so neither dimension exceeds the limit.
      if (w > maxWidth || h > maxHeight) {
        const scale = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null'))),
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}
