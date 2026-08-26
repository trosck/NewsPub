import { API_PREFIX, API_URL } from "../config.ts";

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
}

export async function postUpload(file: File): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}${API_PREFIX}/upload`, {
    method: "POST",
    body: form,
    credentials: "include",
  });

  const data = (await res.json().catch(() => null)) as
    | UploadedFile
    | { error?: string }
    | null;

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? "Upload failed";
    throw new Error(message);
  }

  return data as UploadedFile;
}
