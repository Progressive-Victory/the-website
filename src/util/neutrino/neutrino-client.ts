import { NeutrinoAPIError, NeutrinoClientOptions } from "./interface";
import { ContentTypes, NeutrinoEndpoint, NeutrinoLocales, NeutrinoRoutes, RouteLike } from './types';

// const CONNECT_TIMEOUT = 10*1000

export class NeutrinoClient {
  readonly bassURL: NeutrinoEndpoint
  readonly contentType: string

  constructor(
    private userID: string,
    private apiKey: string,
    options?: NeutrinoClientOptions
  ) {
    this.bassURL = options?.baseURL ?? NeutrinoEndpoint.MULTICLOUD
    this.contentType = options?.contentType ?? ContentTypes.urlencoded
  }

  fetch(method: string, route: RouteLike, data: URLSearchParams) {
    const endpoint = this.bassURL + route
    const body = data.toString()
    return fetch(endpoint, {
      method,
      headers: {
        'User-ID': this.userID,
        'API-Key': this.apiKey,
        'Content-Type': this.contentType,
      },
      body
    })

  }

  async verifySecurityCode(code: number | string, limitBy?: string): Promise<boolean> {
    const formData = new URLSearchParams({
      'security-code': code.toString(),
    })

    if (limitBy) formData.set('limit-by', limitBy)

    const response = await this.fetch('POST', NeutrinoRoutes.VerifySecurityCode, formData)
    const data = await response.json()

    if ('verified' in data && typeof data.verified === 'boolean') {
      return data.verified as boolean
    }
    throw Error('Unexpected response from neutrinoAPI', { cause: data })
  }

  async smsVerify(number: string, options?: {
    codeLength?: number,
    securityCode?: number,
    brandName?: string,
    countryCode?: string,
    languageCode?: NeutrinoLocales,
    limit?: number,
    limitTTL?: number
  }

  ) {
    const formData = new URLSearchParams({
      'number': number,
    })
    if (options) {
      if (options.codeLength && options.codeLength >= 4 && options.codeLength <= 12) {
        formData.set('code-length', Math.round(options.codeLength).toString())
      }
      if (options.securityCode) formData.set('security-code', Math.round(options.securityCode).toString())
      if (options.brandName) formData.set('brand-name', options.brandName)
      if (options.countryCode) formData.set('country-code', options.countryCode)
      if (options.languageCode) formData.set('language-code', options.languageCode)
      if (options.limit) formData.set('limit', Math.round(options.limit).toString())
      if (options.limitTTL) formData.set('limit-ttl', Math.round(options.limitTTL).toString())
    }

    const response = await this.fetch('POST', NeutrinoRoutes.SmsVerify, formData)
    return (await response.json()) as { sent: boolean, 'number-valid': boolean, 'security-code': string } | NeutrinoAPIError
  }

}