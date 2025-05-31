export type RouteLike = `/${string}`

export enum NeutrinoEndpoint {
    MULTICLOUD = 'https://neutrinoapi.net/',
    AWS= 'https://aws.neutrinoapi.net/',
    GCP = 'https://gcp.neutrinoapi.net/',
    BACKUP = 'https://neutrinoapi.com/',
    EU_GEOFENCE = 'https://eu.neutrinoapi.net/',
    AU_GEOFENCE = 'https://aus.neutrinoapi.net/',
    DE_GEOFENCE = 'https://deu.neutrinoapi.net',
    NL_GEOFENCE = 'https://nld.neutrinoapi.net',
    US_GEOFENCE = 'https://usa.neutrinoapi.net/'
}

export enum ContentTypes {
    urlencoded = 'application/x-www-form-urlencoded',
    json = 'application/json',
    formData = 'multipart/form-data'
}

export enum NeutrinoRoutes {
    VerifySecurityCode = '/verify-security-code',
    SmsVerify = '/sms-verify'
}
export enum NeutrinoLocales {
    German = 'de',
    English = 'en',
    Spanish = 'es',
    French = 'fr',
    Italian = 'it',
    Portuguese = 'pt',
    Russian = 'ru'
}