const express = require('express');
const multer  = require('multer');
const { uploadImage, uploadImages, deleteImage } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Images only'));
  },
});

const router = express.Router();

router.post('/image',  protect, authorize('admin'), upload.single('image'),   uploadImage);
router.post('/images', protect, authorize('admin'), upload.array('images', 10), uploadImages);
router.delete('/image', protect, authorize('admin'), deleteImage);

module.exports = router;
