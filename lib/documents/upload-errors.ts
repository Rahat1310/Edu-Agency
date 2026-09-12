export type UploadProblem = {
  title: string;
  description: string;
  kind: "too-large" | "wrong-type" | "network" | "timeout" | "rate" | "other";
};

const TOO_LARGE: UploadProblem = {
  kind: "too-large",
  title: "That file is over 10 MB",
  description: "Compress it, or photograph one page at a time and send those.",
};

const WRONG_TYPE: UploadProblem = {
  kind: "wrong-type",
  title: "We can only take PDF, JPG, or PNG",
  description:
    "If this is a Word file or a photo in another format, export it as PDF or take a JPG photo of the page.",
};

const NETWORK: UploadProblem = {
  kind: "network",
  title: "The network dropped before the file arrived",
  description:
    "Check your connection and try once more. The file was not saved.",
};

const TIMEOUT: UploadProblem = {
  kind: "timeout",
  title: "That upload took too long",
  description:
    "Try a smaller file, or move closer to a stronger connection, then send it again.",
};

const RATE: UploadProblem = {
  kind: "rate",
  title: "Please wait before sending another file",
  description:
    "Give it a few minutes, then try again — or WhatsApp us the scan.",
};

export function explainWrongTypeFile(): UploadProblem {
  return WRONG_TYPE;
}

function looksTooLarge(message: string): boolean {
  return /over \d+\s*mb|too large|file is over/i.test(message);
}

function looksWrongType(message: string): boolean {
  return /pdf|jpg|png|filename|file type|executable|real pdf/i.test(message);
}

export function explainChooseFileProblem(
  file: File,
  maxBytes: number,
): UploadProblem | null {
  if (file.size <= 0) {
    return {
      kind: "other",
      title: "That file looks empty",
      description:
        "Pick the scan again from your phone or computer and send it once more.",
    };
  }

  if (file.size > maxBytes) {
    return TOO_LARGE;
  }

  return null;
}

export function explainUploadProblem(input: {
  stage: "start" | "put" | "save";
  status?: number;
  serverMessage?: string;
  error?: unknown;
}): UploadProblem {
  if (isTimeout(input.error)) {
    return TIMEOUT;
  }

  if (isNetworkError(input.error) || input.status === 0) {
    return NETWORK;
  }

  if (input.status === 429) {
    return RATE;
  }

  const message = input.serverMessage?.trim() ?? "";

  if (input.status === 413 || looksTooLarge(message)) {
    return TOO_LARGE;
  }

  if (looksWrongType(message)) {
    return { ...WRONG_TYPE, description: message || WRONG_TYPE.description };
  }

  if (input.status === 503) {
    return {
      kind: "other",
      title: "Uploads aren't available right now",
      description:
        message ||
        "WhatsApp us the scan for now. We'll add it to your file from our side.",
    };
  }

  if (message) {
    return {
      kind: "other",
      title:
        input.stage === "start"
          ? "We couldn't start the upload"
          : input.stage === "put"
            ? "The file didn't reach us"
            : "The file wasn't saved",
      description: message,
    };
  }

  if (input.stage === "put") {
    return {
      kind: "other",
      title: "The file didn't reach us",
      description: "Try again. If it keeps failing, WhatsApp us the scan.",
    };
  }

  if (input.stage === "save") {
    return {
      kind: "other",
      title: "The file wasn't saved",
      description:
        "It may have reached us, but it isn't in your file yet. Try sending it once more.",
    };
  }

  return {
    kind: "other",
    title: "We couldn't start the upload",
    description:
      "Try again in a moment. If it keeps failing, WhatsApp us the scan.",
  };
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return /network|fetch|failed to fetch|load failed|err_internet/i.test(
    error.message,
  );
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && /timeout/i.test(error.message);
}
