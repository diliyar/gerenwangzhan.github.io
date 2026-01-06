const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticateToken } = require('../middleware/auth');

// 管理员权限检查中间件
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: '需要管理员权限'
    });
  }
  next();
}

// 仪表盘
router.get('/dashboard', authenticateToken, requireAdmin, AdminController.getDashboardStats);

// 用户管理
router.get('/users', authenticateToken, requireAdmin, AdminController.getAllUsers);
router.put('/users/:id/status', authenticateToken, requireAdmin, AdminController.updateUserStatus);
router.delete('/users/:id', authenticateToken, requireAdmin, AdminController.deleteUser);

// 文章管理
router.get('/posts', authenticateToken, requireAdmin, AdminController.getAllPosts);
router.put('/posts/batch-status', authenticateToken, requireAdmin, AdminController.batchUpdatePostStatus);
router.delete('/posts/batch-delete', authenticateToken, requireAdmin, AdminController.batchDeletePosts);

// 系统管理
router.get('/settings', authenticateToken, requireAdmin, AdminController.getSystemSettings);
router.put('/settings', authenticateToken, requireAdmin, AdminController.updateSystemSettings);

// 分类管理
router.get('/categories', AdminController.getCategories);
router.post('/categories', authenticateToken, requireAdmin, AdminController.createCategory);
router.put('/categories/:id', authenticateToken, requireAdmin, AdminController.updateCategory);
router.delete('/categories/:id', authenticateToken, requireAdmin, AdminController.deleteCategory);

module.exports = router;