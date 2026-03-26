const express    = require('express');
const multer     = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { protect, authorize } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router  = express.Router();
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'));
  },
});

const toCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: `bermstone/${folder}`, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (err, result) => (err || !result ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
      )
      .end(buffer);
  });

// POST /api/upload/image
router.post('/image', protect, authorize('admin'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
    const result = await toCloudinary(req.file.buffer, req.body.folder || 'properties');
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// POST /api/upload/images
router.post('/images', protect, authorize('admin'), upload.array('images', 10), async (req, res, next) => {
  try {
    const files = req.files;
    if (!files?.length) return res.status(400).json({ success: false, message: 'No files' });
    const results = await Promise.all(files.map(f => toCloudinary(f.buffer, req.body.folder || 'properties')));
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// DELETE /api/upload/image
router.delete('/image', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ success: false, message: 'publicId required' });
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
