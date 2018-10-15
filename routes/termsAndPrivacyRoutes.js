const router = require('express').Router();
const static = require('../webservices/termsAndPrivacyController');
const authHandler = require('../middleware/auth_handler');

// router.post('/saveStatic', static.saveStatic);
router.post('/updateStatic', static.updateStatic);
router.get('/getStaticContent', static.getStaticContent);
router.get('/getTutorials', static.getTutorials);
router.get('/getSupport', static.getSupport);
router.get('/getService', static.getService);
router.get('/getHomeService', static.getHomeService);
router.get('/whyUs', static.whyUs);
router.get('/howItWork', static.howItWork);

module.exports = router;