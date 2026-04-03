const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const toCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder:          `bermstone/${folder}`,
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (err, result) => (err || !result ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
      )
      .end(buffer);
  });

// POST /api/upload/image
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    const result = await toCloudinary(req.file.buffer, req.body.folder || 'properties');
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// POST /api/upload/images
exports.uploadImages = async (req, res, next) => {
  try {
    const files = req.files;
    if (!files?.length)
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    const results = await Promise.all(
      files.map(f => toCloudinary(f.buffer, req.body.folder || 'properties'))
    );
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

// DELETE /api/upload/image
exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId)
      return res.status(400).json({ success: false, message: 'publicId is required' });
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Image deleted from Cloudinary' });
  } catch (err) { next(err); }
};
