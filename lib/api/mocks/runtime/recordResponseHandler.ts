import RecordResponseHandler from '../recordResponseHandler';
import Registry from '../../../registry';

/** Handler that takes care of recording the response for runtime. */
class RuntimeRecordResponseHandler extends RecordResponseHandler {
    /** @inheritDoc */
    record(registry: Registry, ngApimockId?: string): void {
        registry.record = !registry.record;
    }
}

export default RuntimeRecordResponseHandler;
