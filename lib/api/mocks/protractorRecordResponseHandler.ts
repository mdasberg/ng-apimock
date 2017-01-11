import {Registry} from "../../registry";
import {RecordResponseHandler} from "./recordResponseHandler";

/** Handler that takes care of recording the response for protractor. */
export class ProtractorRecordResponseHandler extends RecordResponseHandler {
    /** @inheritDoc */
    record(registry: Registry, ngApimockId?: string): void {
        // no recording possible for protractor
    }
}
