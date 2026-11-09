export interface DeepLinkParams {
  url: string;
  scheme: string;
  host: string;
  queryParams?: Record<string, string>;
}
