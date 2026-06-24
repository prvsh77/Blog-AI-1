import mongoose from "mongoose";
import { MockSubscriberModel } from '../configs/mockDb.js';

const subscriberSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
},{timestamps: true});

const MongooseSubscriber = mongoose.model('subscriber', subscriberSchema);

const SubscriberProxy = new Proxy(MongooseSubscriber, {
    get(target, prop) {
        if (global.isMockDB) {
            const val = Reflect.get(MockSubscriberModel, prop);
            return typeof val === 'function' ? val.bind(MockSubscriberModel) : val;
        }
        const val = Reflect.get(target, prop);
        return typeof val === 'function' ? val.bind(target) : val;
    }
});

export default SubscriberProxy;
