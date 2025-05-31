import { NeutrinoEndpoint } from "./types";

export interface NeutrinoClientOptions {
  baseURL?: NeutrinoEndpoint,
  contentType?: string
}

export interface NeutrinoAPIError {
  'api-error': number,
  'api-error-msg': string
}