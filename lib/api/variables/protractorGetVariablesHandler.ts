import {Registry} from "../../registry";
import {helper} from "../helper";
import {GetVariablesHandler} from "./getVariablesHandler";

/** Handler that takes care of getting all the variables for protractor. */
export class ProtractorGetVariablesHandler extends GetVariablesHandler {
    /** @inheritDoc */
    getVariables(registry: Registry, ngApimockId?: string): {} {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].variables;
    }
}