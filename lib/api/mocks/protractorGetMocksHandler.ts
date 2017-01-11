import {Registry} from "../../registry";
import {GetMocksHandler} from "./GetMocksHandler";
import {helper} from "../helper";

/** Handler that takes care of getting all the mocks for protractor. */
export class ProtractorGetMocksHandler extends GetMocksHandler {
    /** @inheritDoc */
    getSelections(registry: Registry, ngApimockId?: string): {} {
        helper.protractor.addSessionIfNonExisting(registry, ngApimockId);
        return registry.sessions[ngApimockId].selections;
    }
}
