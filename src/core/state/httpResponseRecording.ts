/** An actual http response recording.*/
interface HttpResponseRecording {
    data: string;
    payload: string;
    datetime: number;
    method: string;
    url: string;
    statusCode: number;
}

export default HttpResponseRecording;
