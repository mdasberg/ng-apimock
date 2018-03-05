import Mock from '../tasks/mock';
import Preset from '../tasks/preset';

class Registry {
    mocks: Mock[];
    presets: Preset[];
    defaults: { [key: string]: string };
    sessions: {
        [key: string]: {
            selections: { [key: string]: string };
            variables: { [key: string]: string };
            delays: { [key: string]: number };
            echos: { [key: string]: boolean };
        }
    };
    selections: { [key: string]: string };
    variables: { [key: string]: string };
    recordings: { [key: string]: Recording[] };
    delays: { [key: string]: number };
    echos: { [key: string]: boolean };
    record: boolean;

    constructor() {
        this.mocks = [];
        this.defaults = {};
        this.sessions = {};
        this.selections = {};
        this.variables = {};
        this.recordings = {};
        this.delays = {};
        this.echos = {};

        this.record = false;
    }
}

export class Recording {
    data: string;
    payload: string;
    datetime: number;
    method: string;
    url: string;
    statusCode: number;
}

export default Registry;
