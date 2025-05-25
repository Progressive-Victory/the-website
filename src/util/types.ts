export enum HTTPStatus {
    /**
     * This interim response indicates that the client should continue the request or ignore the response if the request is already finished.
     */
    Continue = 100,
    /**
     * This code is sent in response to an {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Upgradev `Upgrade`} request header from the client and indicates the protocol the server is switching to.
     */
    SwitchingProtocol = 101,
    /**
     * This code was used in {@link https://developer.mozilla.org/en-US/docs/Glossary/WebDAV WebDAV} contexts to indicate that a request has been received by the server, but no status was available at the time of the response.
     * @deprecated This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible;
     */
    Processing = 102,
    /**
     * This status code is primarily intended to be used with the {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link `Link`} header, letting the user agent start {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload preloading} resources while the server prepares a response or {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preconnectpreconnect} to an origin from which the page will need resources.
     */
    EarlyHint = 103,
    
    /**
     * The request succeeded. The result and meaning of "success" depends on the HTTP method
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/200 MDN Web Docs}
     */
    Ok = 200,
    /**
     * The request succeeded, and a new resource was created as a result. This is typically the response sent after `POST` requests, or some `PUT` requests.
     */
    Created = 201,
    /**
     * The request has been received but not yet acted upon. It is noncommittal, since there is no way in HTTP to later send an asynchronous response indicating the outcome of the request. It is intended for cases where another process or server handles the request, or for batch processing.
     */
    Accepted = 202,
    /**
     * This response code means the returned metadata is not exactly the same as is available from the origin server, but is collected from a local or a third-party copy. This is mostly used for mirrors or backups of another resource. Except for that specific case, the `200 OK` response is preferred to this status.
     */
    NonAuthoritativeInformation = 203,
    /**
     * There is no content to send for this request, but the headers are useful. The user agent may update its cached headers for this resource with the new ones.
     */
    NoContent = 204,
    /**
     * Tells the user agent to reset the document which sent this request.
     */
    ResetContent = 205,
    /**
     * This response code is used in response to a {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests range request} when the client has requested a part or parts of a resource.
     */
    PartialContent = 206,
    /**
     * Conveys information about multiple resources, for situations where multiple status codes might be appropriate.
     */
    MultiStatus = 207,
    /**
     * Used inside a `<dav:propstat>` response element to avoid repeatedly enumerating the internal members of multiple bindings to the same collection.
     */
    AlreadyReported = 208,
    /**
     * The server has fulfilled a `GET` request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
     */
    IMUsed = 226,
    
    /**
     * In {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation#agent-driven_negotiation agent-driven content negotiation}, the request has more than one possible response and the user agent or user should choose one of them. There is no standardized way for clients to automatically choose one of the responses, so this is rarely used.
     */
    MultipleChoices = 300,
    /**
     * The URL of the requested resource has been changed permanently. The new URL is given in the response.
     */
    MovedPermanently = 301,
    /**
     * This response code means that the URI of requested resource has been changed temporarily. Further changes in the URI might be made in the future, so the same URI should be used by the client in future requests.
     */
    Found = 302,
    /**
     * The server sent this response to direct the client to get the requested resource at another URI with a `GET` request.
     */
    SeeOther = 303,
    /**
     * This is used for caching purposes. It tells the client that the response has not been modified, so the client can continue to use the same cached version of the response.
     */
    NotModified = 304,
    /**
     * @deprecated Defined in a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy. It has been deprecated due to security concerns regarding in-band configuration of a proxy.
     */
    UseProxy = 305,
    /**
     * This response code is no longer used; but is reserved. It was used in a previous version of the HTTP/1.1 specification.
     */
    Unused = 306,
    /**
     * The server sends this response to direct the client to get the requested resource at another URI with the same method that was used in the prior request. This has the same semantics as the `302 Found` response code, with the exception that the user agent must not change the HTTP method used: if a `POST` was used in the first request, a `POST` must be used in the redirected request.
     */
    TemporaryRedirect = 307,
    /**
     * This means that the resource is now permanently located at another URI, specified by the {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Location `Location`} response header. This has the same semantics as the `301 Moved Permanently` HTTP response code, with the exception that the user agent must not change the HTTP method used: if a `POST` was used in the first request, a `POST` must be used in the second request.
     */
    PermanentRedirect = 308,
    
    /**
     * The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
     */
    BadRequest = 400,
    /**
     * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
     */
    UnAuthorized = 401,
    /**
     * The initial purpose of this code was for digital payment systems, however this status code is rarely used and no standard convention exists.
     */
    PaymentRequired = 402,
    /**
     * The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike `401 Unauthorized`, the client's identity is known to the server.
     */
    Forbidden = 403,
    /**
     * The server cannot find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of `403 Forbidden` to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web.
     */
    NotFound = 404,
    /**
     * The {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods request method} is known by the server but is not supported by the target resource. For example, an API may not allow `DELETE` on a resource, or the `TRACE` method entirely.
     */
    MethodNotAllowed = 405,
    /**
     * This response is sent when the web server, after performing {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation#server-driven_content_negotiation server-driven content negotiation}, doesn't find any content that conforms to the criteria given by the user agent.
     */
    NotAccepted = 406,
    /**
     * This is similar to `401 Unauthorized` but authentication is needed to be done by a proxy.
     */
    ProxyAuthenticationRequired = 407,
    /**
     * This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. This response is used much more since some browsers use HTTP pre-connection mechanisms to speed up browsing. Some servers may shut down a connection without sending this message.
     */
    RequestTimeout = 408,
    /**
     * This response is sent when a request conflicts with the current state of the server. In {@link https://developer.mozilla.org/en-US/docs/Glossary/WebDAV WebDAV} remote web authoring, `409` responses are errors sent to the client so that a user might be able to resolve a conflict and resubmit the request.
     */
    Conflict = 409,
    /**
     * This response is sent when the requested content has been permanently deleted from server, with no forwarding address. Clients are expected to remove their caches and links to the resource. The HTTP specification intends this status code to be used for "limited-time, promotional services". APIs should not feel compelled to indicate resources that have been deleted with this status code.
     */
    Gone = 410,
    /**
     * Server rejected the request because the {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Length `Content-Length`} header field is not defined and the server requires it.
     */
    LengthRequired = 411,
    /**
     * In {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests conditional requests} , the client has indicated preconditions in its headers which the server does not meet.
     */
    PreconditionFailed = 412,
    /**
     * The request body is larger than limits defined by server. The server might close the connection or return an {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After `Retry-After`} header field.
     */
    ContentTooLarge = 413,
    /**
     * The URI requested by the client is longer than the server is willing to interpret.
     */
    URITooLong = 414,
    /**
     * The media format of the requested data is not supported by the server, so the server is rejecting the request.
     */
    UnsupportedMediaType = 415,
    /**
     * The {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests ranges} specified by the `Range` header field in the request cannot be fulfilled. It's possible that the range is outside the size of the target resource's data.
     */
    RangeNotSatisfiable = 416,
    /**
     * This response code means the expectation indicated by the {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Expect `Expect`}request header field cannot be met by the server.
     */
    ExpectationFailed = 417,
    /**
     * The server refuses the attempt to brew coffee with a teapot.
     */
    ImATeapot = 418,
    /**
     * The request was directed at a server that is not able to produce a response. This can be sent by a server that is not configured to produce responses for the combination of scheme and authority that are included in the request URI.
     */
    MisdirectedRequest = 421,
    /**
     * The request was well-formed but was unable to be followed due to semantic errors.
     */
    UnprocessableContent = 422,
    /**
     * The resource that is being accessed is locked.
     */
    Locked = 423,
    /**
     * The request failed due to failure of a previous request.
     */
    FailedDependency = 424,
    /**
     * Indicates that the server is unwilling to risk processing a request that might be replayed.
     * @experimental This feature is not Baseline because it does not work in some of the most widely-used browsers.
     */
    TooEarly = 425,
    /**
     * The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. The server sends an {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Upgrade `Upgrade`} header in a 426 response to indicate the required protocol(s).
     */
    UpgradeRequired = 426,
    /**
     * The origin server requires the request to be conditional. This response is intended to prevent the 'lost update' problem, where a client `GET`s a resource's state, modifies it and `PUT`s it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
     */
    PreconditionRequired = 428,
    /**
     * The user has sent too many requests in a given amount of time (rate limiting).
     */
    TooManyRequests = 429,
    /**
     * The server is unwilling to process the request because its header fields are too large. The request may be resubmitted after reducing the size of the request header fields.
     */
    RequestHeaderFieldsTooLarge = 431,
    /**
     * The user agent requested a resource that cannot legally be provided, such as a web page censored by a government.
     */
    UnavailableForLegalReasons = 451,
    
    /**
     * The server has encountered a situation it does not know how to handle. This error is generic, indicating that the server cannot find a more appropriate `5XX` status code to respond with.
     */
    InternalServerError = 500,
    /**
     * The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are `GET` and `HEAD`.
     */
    NotImplemented = 501,
    /**
     * This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
     */
    BadGateway = 502,
    /**
     * The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This response should be used for temporary conditions and the {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After `Retry-After`} HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached.
     */
    ServiceUnavailable = 503,
    /**
     * This error response is given when the server is acting as a gateway and cannot get a response in time.
     */
    GatewayTimeout = 504,
    /**
     * The HTTP version used in the request is not supported by the server.
     */
    HTTPVersionNotSupported = 505,
    /**
     * The server has an internal configuration error: during content negotiation, the chosen variant is configured to engage in content negotiation itself, which results in circular references when creating responses.
     */
    VariantAlsoNegotiates = 506,
    /**
     * The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.
     */
    InsufficientStorage = 507,
    /**
     * The server detected an infinite loop while processing the request.
     */
    LoopDetected = 508,
    /**
     * The client request declares an HTTP Extension ({@link https://datatracker.ietf.org/doc/html/rfc2774 RFC 2774}) that should be used to process the request, but the extension is not supported.
     */
    NotExtended = 510,
    /**
     * Indicates that the client needs to authenticate to gain network access.
     */
    NetworkAuthenticationsRequired = 511
}