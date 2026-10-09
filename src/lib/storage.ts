/**
 * Storage object paths for the public URLs that point into `bucket`, e.g.
 * ".../storage/v1/object/public/product-images/products/a.webp" →
 * "products/a.webp". Anything else (bundled /images, other buckets, other
 * hosts' URLs) is ignored, so a delete can never reach outside the bucket.
 */
export function storagePathsIn(urls: string[], bucket: string): string[] {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const paths: string[] = [];
  for (const url of urls) {
    if (!url.startsWith("https://")) continue;
    const index = url.indexOf(marker);
    if (index === -1) continue;
    const path = decodeURIComponent(url.slice(index + marker.length).split("?")[0] ?? "");
    if (path && !path.split("/").includes("..")) paths.push(path);
  }
  return paths;
}
