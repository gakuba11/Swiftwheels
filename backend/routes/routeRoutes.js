const express = require('express');
const routeController = require('../controllers/routeController');

const router = express.Router();

router.post('/', routeController.createRoute);
router.get('/', routeController.getRoutes);
router.get('/:id', routeController.getRouteById);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

module.exports = router;
