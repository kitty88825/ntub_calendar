export class Token {
  accessToken: string;
  token?: {
    access?: string;
    refresh?: string;
  };
  staff?: boolean;
}
