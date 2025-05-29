/**
 * A wrapper around browser's URL for some utility params.
 *
 * @author Shashank Agrawal
 */
export class URLWrapper {

    private readonly _url: URL;
    private readonly _params: URLSearchParams;

    constructor(rawURL: string) {
        try {
            this._url = new URL(rawURL);
            this._params = new URLSearchParams(this._url.search);
        } catch (e) {
            console.error('Un-parsable URL', e);
        }
    }

    /**
     * Method to get the value from the search params. Also handle any string of 'undefined' or 'null'.
     * @param name The parameter name to get the value
     * @return The parameter value. Return empty string if not available.
     */
    getParam(name: string): string | undefined {
        if (!this._params) {
            return '';
        }

        const value = this._params.get(name);
        return (!value || value === 'undefined' || value === 'null') ? undefined : value;
    }
}