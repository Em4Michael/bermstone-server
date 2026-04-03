const express = require('express');
const {
  getProperties, getCities, getProperty,
  createProperty, updateProperty, deleteProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',              getProperties);
router.get('/meta/cities',   getCities);
router.get('/:id',           getProperty);
router.post('/',   protect, authorize('admin'), createProperty);
router.put('/:id', protect, authorize('admin'), updateProperty);
router.delete('/:id', protect, authorize('admin'), deleteProperty);

module.exports = router;
