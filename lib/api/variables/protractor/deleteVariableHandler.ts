import {Registry} from "../../../registry";
import {helper} from "../../helper";
import {DeleteVariablesHandler} from "../deleteVariableHandler";

/** Handler that takes care of deleting a variable for protractor. */
export class ProtractorDeleteVariableHandler extends DeleteVariablesHandler {
    /** @inheritDoc */
    deleteVariable(registry: Registry, variable: string, ngApimockId?: string): void {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        delete registry.sessions[ngApimockId].variables[variable];
    }
}