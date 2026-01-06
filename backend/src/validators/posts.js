const { body } = require('express-validator');

const createPostValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('标题长度必须在1-200个字符之间'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('内容不能为空'),
  body('category')
    .isIn(['growth', 'gaming', 'interests', 'photography'])
    .withMessage('无效的文章分类'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('特色图片必须是有效的URL')
];

const updatePostValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('标题长度必须在1-200个字符之间'),
  body('content')
    .optional()
    .isLength({ min: 1 })
    .withMessage('内容不能为空'),
  body('category')
    .optional()
    .isIn(['growth', 'gaming', 'interests', 'photography'])
    .withMessage('无效的文章分类'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('特色图片必须是有效的URL')
];

module.exports = {
  createPostValidation,
  updatePostValidation
};