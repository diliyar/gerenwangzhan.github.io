const express = require('express');
const router = express.Router();
const { ImageController, upload } = require('../controllers/ImageController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', ImageController.getImages);
router.get('/:id', ImageController.getImage);
router.get('/stats/summary', ImageController.getImageStats);
router.post('/upload', authenticateToken, upload.single('image'), ImageController.uploadImage);
router.delete('/:id', authenticateToken, ImageController.deleteImage);
router.delete('/batch/delete', authenticateToken, ImageController.deleteMultipleImages);

module.exports = router;