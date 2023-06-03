export interface Email {
  subject: string;
  body: string;
  send_to: string;
  sent_from: string;
  reply_to: string;
}

export interface resetSuccessType {
  username: string | undefined;
  browser: string;
  OS: string;
}
