/** Mock response. */
interface MockRequest {
    // the url
    url: string;
    // the http method (GET, POST, PUT, DELETE)
    method: string;
    // body
    body?: { [key: string]: string };
    // body
    headers?: { [key: string]: string };
}

export default MockRequest;
