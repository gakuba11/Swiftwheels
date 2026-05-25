const express = require('express');
const reservationController = require('../controllers/reservationController');

const router = express.Router();

router.get('/search', reservationController.searchSchedules);
router.get('/schedules/:scheduleId/seats', reservationController.getSeatsForSchedule);
router.post('/', reservationController.reserve);

module.exports = router;
