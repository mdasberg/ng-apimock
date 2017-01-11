import * as http from "http";
import * as fs from "fs-extra";
import * as url from "url";
import {Handler} from "./handler";
import {Registry} from "./registry";
import {Mock} from "../tasks/mock";
import {httpHeaders} from "./http";

/** Abstract Handler for a request. */
export abstract class NgApimockHandler implements Handler {
    MAX_RECORDINGS_PER_MOCK = 2;

    /**
     * Gets the selection.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     * @return selection The selection.
     */
    abstract getSelection(registry: Registry, identifier: string, ngApimockId: string): string;

    /**
     * Gets the variables.
     * @param registry The registry.
     * @param ngApimockId The ngApimock id.
     * @return variables The variables.
     */
    abstract getVariables(registry: Registry, ngApimockId?: string): {};

    /**
     * @inheritDoc
     *
     * Handler that takes care of request.
     *
     * The following requests are available:
     * - a normal api call
     * - a record call
     */
    handleRequest(request: http.IncomingMessage, response: http.ServerResponse, next: Function, registry: Registry, ngApimockId: string): void {
        // #1
        const match = this.getMatchingMock(registry.mocks, request.url, request.method);
        let payload: string;

        if (match) {
            request.on('data', (rawData: string) => {
                payload = rawData.toString();
            });

            const selection = this.getSelection(registry, match.identifier, ngApimockId),
                variables = this.getVariables(registry, ngApimockId);

            const mockResponse = match.responses[selection];
            if (mockResponse !== undefined) {
                if (!!match.echo) {
                    console.log(match.method + ' request made on \'' + match.expression + '\' with payload: ', payload);
                }

                const statusCode = mockResponse.status || 200,
                    jsonCallbackName = this.getJsonCallbackName(request.url);

                let headers, chunk;

                if (this.isBinaryResponse(mockResponse)) {
                    headers = mockResponse.headers || httpHeaders.CONTENT_TYPE_BINARY;
                    chunk = fs.readFileSync(mockResponse.file).toString('utf8');
                } else {
                    headers = mockResponse.headers || httpHeaders.CONTENT_TYPE_APPLICATION_JSON;
                    chunk = this.updateData(mockResponse.data, variables, (match.isArray ? [] : {}));
                }

                if (jsonCallbackName !== false) {
                    chunk = jsonCallbackName + '(' + chunk + ')';
                }

                response.writeHead(statusCode, headers);
                response.end(chunk);

                if (registry.record) {
                    this.storeRecording(payload, chunk, request, statusCode, registry, match.identifier);
                }
            } else {
                // remove the recording header to stop recording after this call succeeds
                if (registry.record && !request.headers.record) {
                    const headers = request.headers,
                        options = {
                            host: headers.host.split(':')[0],
                            port: headers.host.split(':')[1],
                            path: request.url,
                            method: request.method,
                            headers: headers
                        };

                    headers.record = 'off';

                    const req = http.request(options, (res: http.IncomingMessage) => {
                        res.setEncoding('utf8');
                        res.on('data', (chunk: Buffer) => {
                            this.storeRecording(payload, chunk.toString('utf8'), request, res.statusCode, registry, match.identifier);
                            response.end(chunk);
                        });
                    });

                    req.on('error', function (e) {
                        response.end(e);
                    });
                    req.end();
                } else {
                    next();
                }
            }
        } else {
            next();
        }
    }

    /**
     * Get the mock matching the given request.
     * @param mocks The mocks.
     * @param url The http request url.
     * @param method The http request method.
     * @returns matchingMock The matching mock.
     */
    getMatchingMock(mocks: Mock[], url: string, method: string): Mock {
        return mocks.filter(_mock => {
            const expressionMatches = new RegExp(_mock.expression).exec(url) !== null,
                methodMatches = _mock.method === method;

            return expressionMatches && methodMatches;
        })[0];
    }

    /**
     * Indicates if the given response is a binary response.
     * @param response The response
     * @return {boolean} indicator The indicator.
     */
    isBinaryResponse(response: any): boolean {
        return response.file !== undefined;
    }

    /**
     * Update the response data with the globally available variables.
     * @param data The data.
     * @param variables The variables.
     * @param defaults The defaults.
     * @return updatedData The updated data.
     */
    updateData(data: any, variables: {[key: string]: string}, defaults: any): string {
        let _data: string;

        if (data !== undefined) {
            _data = JSON.stringify(data);
            Object.keys(variables).forEach(function (key) {
                if (variables.hasOwnProperty(key)) {
                    _data = _data.replace(new RegExp("%%" + key + "%%", "g"), variables[key]);
                }
            });
        } else {
            _data = JSON.stringify(defaults);
        }
        return _data;
    }

    /**
     * Get the JSONP callback name.
     * @param requestUrl The request url.
     * @returns {string|boolean} callbackName Either the name or false.
     */
    getJsonCallbackName(requestUrl: string): string|boolean {
        const url_parts = url.parse(requestUrl, true);

        if (!url_parts.query || !url_parts.query.callback) {
            return false;
        }
        return url_parts.query.callback;
    };

    /**
     * Stores the recording with the given mock.
     * @param payload The payload.
     * @param chunk The chunk.
     * @param request The http request.
     * @param statusCode The status code.
     * @param registry The registry.
     * @param identifier The identifier.
     */
    storeRecording(payload: string, chunk: string, request: http.IncomingMessage, statusCode: number, registry: Registry, identifier: string) {
        const result = {
            data: chunk,
            payload: payload,
            datetime: new Date().getTime(),
            method: request.method,
            url: request.url,
            statusCode: statusCode
        };

        if (registry.recordings[identifier] === undefined) {
            registry.recordings[identifier] = [];
        } else if (registry.recordings[identifier].length > (this.MAX_RECORDINGS_PER_MOCK - 1)) {
            registry.recordings[identifier].shift();
        }
        registry.recordings[identifier].push(result);
    }
}
