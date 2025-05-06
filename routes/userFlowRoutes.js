const express = require('express');
const router = express.Router();
const userFlowController = require('../controllers/userFlowController');

router.post('/save', userFlowController.saveUserFlow);
router.get('/:userId', userFlowController.getUserFlow);
router.delete('/:userId', userFlowController.deleteUserFlow);

module.exports = router;
