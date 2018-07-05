interface Mock {
    // the identifier.
    // either name or expression + $$ + method
    identifier: string;
    // the name of the module
    name?: string;
    // type of response object either
    isArray?: boolean;
    // the expression
    expression: string;
    // the http method (GET, POST, PUT, DELETE)
    method: string;
    // the request body
    body?: string;
    // the available responses
    responses: { [key: string]: MockResponse };
}

export interface MockResponse {
    // response status code (default: 200)
    status?: number;
    // response data
    data?: {} | [{}];
    // response as file
    file?: string;
    // response headers
    headers: { [key: string]: string };
    // response status text
    statusText: string;
    // indicates this response is the default response
    default: boolean;
    // delay
    delay?: number;
}

export default Mock;
