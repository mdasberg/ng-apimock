import MockResponse from './mock.response';

/** Mock. */
interface Mock {
    // the name of the module
    name: string;
    // type of response object either
    isArray?: boolean;
    // the expression
    expression: string;
    // the http method (GET, POST, PUT, DELETE)
    method: string;
    // the available responses
    responses: { [key: string]: MockResponse };
}

export default Mock;
