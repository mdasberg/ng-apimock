interface Preset {
    name: string;
    responses: PresetResponse[];
}

export interface PresetResponse {
    name: string;
    scenario: string;
}

export default Preset;
