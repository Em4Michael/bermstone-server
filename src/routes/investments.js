const express = require('express');
const {
  getInvestments,
  getInvestment,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} = require('../controllers/investmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',     getInvestments);
router.get('/:id',  getInvestment);

router.post('/',    protect, authorize('admin'), createInvestment);
router.put('/:id',  protect, authorize('admin'), updateInvestment);
router.delete('/:id', protect, authorize('admin'), deleteInvestment);

module.exports = router;