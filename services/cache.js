const redis = require('redis');
const mongoose = require('mongoose');
const util = require('util');
const keys = require('../config/keys');
const client = redis.createClient(keys.redisURL);

const exec = mongoose.Query.prototype.exec;
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function(options = {}) {
    this.enableCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
};

mongoose.Query.prototype.exec = async function () {
    if (!this.enableCache) {
        return exec.apply(this, arguments);
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    const cachedData = await client.hget(this.hashKey, key);

    if (cachedData) {
        const doc = JSON.parse(cachedData);
        return Array.isArray(doc)
            ? doc.map(e => new this.model(e))
            : new this.model(doc)
    }

    const result = await exec.apply(this, arguments);

    client.hset(this.hashKey, key, JSON.stringify(result));

    return result;
};

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey))
    }
};


