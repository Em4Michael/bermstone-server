const express = require('express');
const {
  getProperties,
  getCities,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ⚠️ CRITICAL: /meta/cities MUST be defined before /:id
// otherwise Express matches "meta" as the :id param
router.get('/meta/cities', getCities);

router.get('/',     getProperties);
router.get('/:id',  getProperty);

router.post('/',    protect, authorize('admin'), createProperty);
router.put('/:id',  protect, authorize('admin'), updateProperty);
router.delete('/:id', protect, authorize('admin'), deleteProperty);

module.exports = router;