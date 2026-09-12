export type ChatApiSuccess = {
  ok: true;
  text: string;
  offerLead: boolean;
};

export type ChatApiErrorCode = "rate_limit" | "validation" | "unavailable";

export type ChatApiFailure = {
  ok: false;
  code: ChatApiErrorCode;
  message: string;
};

export type ChatApiResult = ChatApiSuccess | ChatApiFailure;
