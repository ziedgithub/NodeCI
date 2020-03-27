require('../models/User');
jest.setTimeout(2000000);

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, dbName: 'blog_dev', useUnifiedTopology: true  })