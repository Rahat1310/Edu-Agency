export type PutProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export function putFileWithProgress(
  url: string,
  file: File,
  headers: Record<string, string>,
  onProgress: (progress: PutProgress) => void,
): Promise<{ ok: boolean; status: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);

    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === "content-length") {
        continue;
      }
      xhr.setRequestHeader(key, value);
    }

    xhr.timeout = 120_000;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }

      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: Math.max(
          0,
          Math.min(100, Math.round((event.loaded / event.total) * 100)),
        ),
      });
    };

    xhr.onload = () => {
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
      });
    };

    xhr.onerror = () => {
      reject(new TypeError("Network error"));
    };

    xhr.ontimeout = () => {
      reject(new Error("timeout"));
    };

    xhr.send(file);
  });
}
