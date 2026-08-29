interface CompressOptions {
  /** Longest edge in px the image is scaled down to. */
  maxDim?: number;
  /** WebP quality, 0–1. */
  quality?: number;
}

/**
 * Downscales and re-encodes an image to WebP in the browser before upload, so
 * huge phone photos (3–5 MB) become fast, right-sized web images automatically
 * — the client never has to think about it, and the storefront can't slow down
 * as inventory grows. Fails safe: on any error, an unsupported type (SVG/GIF),
 * or when re-encoding wouldn't be smaller, the original file is returned
 * untouched.
 */
export async function compressImage(
  file: File,
  { maxDim = 1600, quality = 0.82 }: CompressOptions = {},
): Promise<File> {
  if (
    typeof document === "undefined" ||
    typeof createImageBitmap === "undefined" ||
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  try {
    // `from-image` honours EXIF orientation so sideways phone photos come out
    // upright instead of rotated.
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^./\\]+$/, "") + ".webp";
    return new File([blob], name, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
