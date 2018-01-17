/** Mock response. */
interface MockRequest {
    // the url
    url: string;
    // the http method (GET, POST, PUT, DELETE)
    method: string;
    // payload
    payload?: { [key: string]: string };
    // payload
    headers?: { [key: string]: string };
}

export default MockRequest;
