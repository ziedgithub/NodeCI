const AWS = require('aws-sdk');
const {v1: uuid} = require('uuid');
const requireLogin = require('../middlewares/requireLogin');
const keys = require('../config/keys');

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey,
    region:"eu-west-3"
});

module.exports = app => {
    app.get('/api/upload', requireLogin, (req, res) => {
        const key = `${req.user.id}/${uuid()}.jpg`;
        s3.getSignedUrl('putObject', {
            Bucket: 'my-blog-bucket-000',
            ContentType: 'image/jpg',
            Key: key
        }, (err, url) => {
            res.send({key, url});
        })
    })
};