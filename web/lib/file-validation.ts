const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'application/pdf',
]);

const maxUploadBytes = 20 * 1024 * 1024;

export function validateUpload(file: { type: string; size: number; name: string }) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtension = extension !== undefined && ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'pdf'].includes(extension);

  return {
    ok: allowedMimeTypes.has(file.type) && file.size <= maxUploadBytes && allowedExtension,
    maxUploadBytes,
    allowedMimeTypes: Array.from(allowedMimeTypes),
  };
}
