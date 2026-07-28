const express = require('express');
const router = express.Router();
const {
    getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.delete('/', deleteAllNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
