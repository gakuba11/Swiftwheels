const express = require('express');
const busController = require('../controllers/busController');

const router = express.Router();

router.post('/', busController.createBus);
router.get('/', busController.getBuses);
router.get('/:id', busController.getBusById);
router.put('/:id', busController.updateBus);
router.delete('/:id', busController.deleteBus);

module.exports = router;
