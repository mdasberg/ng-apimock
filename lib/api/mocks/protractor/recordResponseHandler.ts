import RecordResponseHandler from '../recordResponseHandler';
import Registry from '../../../registry';

/** Handler that takes care of recording the response for protractor. */
class ProtractorRecordResponseHandler extends RecordResponseHandler {
    /** @inheritDoc */
    record(registry: Registry, ngApimockId?: string): void {
        // no recording possible for protractor
    }
}

export default ProtractorRecordResponseHandler;
