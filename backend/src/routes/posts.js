const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { createPostValidation, updatePostValidation } = require('../validators/posts');

router.get('/', optionalAuth, PostController.getPosts);
router.get('/:id', optionalAuth, PostController.getPost);
router.post('/', authenticateToken, createPostValidation, PostController.createPost);
router.put('/:id', authenticateToken, updatePostValidation, PostController.updatePost);
router.delete('/:id', authenticateToken, PostController.deletePost);
router.get('/user/:userId', PostController.getUserPosts);
router.post('/:id/view', PostController.incrementViewCount);

module.exports = router;