import Registry from '../registry';

module helper {
    export module protractor {
        /**
         * Adds a session to the registry for the given ngApimockId if there isn't any.
         * @param registry The registry.
         * @param ngApimockId The ngApimock id.
         */
        export function addSessionIfNonExisting(registry: Registry, ngApimockId: string): void {
            if (registry.sessions[ngApimockId] === undefined) {
                registry.sessions[ngApimockId] = {
                    selections: JSON.parse(JSON.stringify(registry.defaults)),
                    presets: {},
                    variables: {},
                    delays: {},
                    echos: {}
                };
            }
        }
    }
}

export default helper;
