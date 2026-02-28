import { useState, useCallback } from "react";

interface UploadResponse {
  uploadURL: string;
  objectPath: string;
  metadata: { name: string; size: number; contentType: string };
}

interface UseUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(10);

      try {
        const formData = new FormData();
        formData.append("file", file);

        setProgress(40);
        const res = await fetch("/api/uploads/media", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed: ${text}`);
        }

        const { url } = await res.json();
        setProgress(100);

        const response: UploadResponse = {
          uploadURL: url,
          objectPath: url,
          metadata: { name: file.name, size: file.size, contentType: file.type },
        };

        options.onSuccess?.(response);
        return response;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error("Upload failed");
        setError(uploadError);
        options.onError?.(uploadError);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  const getUploadParameters = useCallback(
    async (_file: { name: string; size: number; type: string }) => {
      return { method: "PUT" as const, url: "", headers: {} };
    },
    []
  );

  return { uploadFile, getUploadParameters, isUploading, error, progress };
}
