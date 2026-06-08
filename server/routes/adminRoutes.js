const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, createCollegeAdmin, adminResetPassword, assignCollegeToAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.post('/create-college', createCollegeAdmin);
router.put('/users/:id/reset-password', adminResetPassword);
router.put('/users/:id/assign-college', assignCollegeToAdmin);

module.exports = router;
