const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

 // Login puis récuperation des VC dispo pour récuperation depuis le registry BO avec le DID participant ?
 router.get('/listVCtypes', userController.listVCtypes);
 router.get('/VCloginType/:vcType', userController.VCloginType);
 router.post('/login', userController.login);
 router.post('/credential', userController.credential);
// router.post('/VC', userController.VC);



// router.post('/form', userController.form);

module.exports = router;
