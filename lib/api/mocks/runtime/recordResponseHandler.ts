import {Registry} from "../../../registry";
import {RecordResponseHandler} from "../recordResponseHandler";

/** Handler that takes care of recording the response for runtime. */
export class RuntimeRecordResponseHandler extends RecordResponseHandler {
    /** @inheritDoc */
    record(registry: Registry, ngApimockId?: string): void {
        registry.record = !registry.record;
    }
}
