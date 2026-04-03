const express = require('express');
const {
  createPayment, getPayments, getPayment,
  confirmPayment, rejectPayment,
} = require('../controllers/investmentPaymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/',                                   createPayment);
router.get('/',    protect, authorize('admin'),    getPayments);
router.get('/:id', protect, authorize('admin'),    getPayment);
router.patch('/:id/confirm', protect, authorize('admin'), confirmPayment);
router.patch('/:id/reject',  protect, authorize('admin'), rejectPayment);

module.exports = router;
