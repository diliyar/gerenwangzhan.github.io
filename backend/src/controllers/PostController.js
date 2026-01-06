const { body, validationResult } = require('express-validator');
const { 
  findMany, 
  findOne, 
  insertOne, 
  updateOne, 
  deleteOne, 
  countDocuments 
} = require('../utils/database');

const POSTS_COLLECTION = 'posts';

// 文章验证规则
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

class PostController {

  // 获取文章列表
  static async getPosts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        search,
        status = 'published' 
      } = req.query;

      const offset = (page - 1) * limit;
      const filter = {};

      if (category) filter.category = category;
      if (search) {
        const allPosts = await findMany(POSTS_COLLECTION, {}, {});
        const filteredPosts = allPosts.filter(post => 
          post.title.toLowerCase().includes(search.toLowerCase()) ||
          post.content.toLowerCase().includes(search.toLowerCase())
        );
        return res.json({
          posts: filteredPosts.slice(offset, offset + parseInt(limit)),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredPosts.length,
            totalPages: Math.ceil(filteredPosts.length / limit)
          }
        });
      }

      // 筛选已发布的文章（公开访问）
      if (status) filter.status = status;

      const posts = await findMany(POSTS_COLLECTION, filter, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        sort: { createdAt: 'desc' }
      });

      // 获取总数
      const total = await countDocuments(POSTS_COLLECTION, filter);

      res.json({
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('获取文章列表错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取单篇文章
  static async getPost(req, res) {
    try {
      const { id } = req.params;
      const post = await findOne(POSTS_COLLECTION, { id: parseInt(id) });

      if (!post) {
        return res.status(404).json({
          error: '文章不存在'
        });
      }

      // 如果是草稿，只有作者或管理员可以查看
      if (post.status === 'draft') {
        const currentUser = req.user;
        if (!currentUser || (currentUser.id !== post.authorId && currentUser.role !== 'admin')) {
          return res.status(403).json({
            error: '无权访问此文章'
          });
        }
      }

      res.json({ post });

    } catch (error) {
      console.error('获取文章错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 创建文章
  static async createPost(req, res) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: '输入验证失败',
          details: errors.array()
        });
      }

      const { title, content, category, tags = [], featuredImage } = req.body;
      const authorId = req.user.id;

      const newPost = {
        title,
        content,
        category,
        tags,
        featuredImage,
        authorId,
        status: 'published',
        viewCount: 0,
        likeCount: 0,
        publishedAt: new Date().toISOString()
      };

      const createdPost = await insertOne(POSTS_COLLECTION, newPost);

      res.status(201).json({
        message: '文章创建成功',
        post: createdPost
      });

    } catch (error) {
      console.error('创建文章错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 更新文章
  static async updatePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // 查找现有文章
      const existingPost = await findOne(POSTS_COLLECTION, { id: parseInt(id) });
      if (!existingPost) {
        return res.status(404).json({
          error: '文章不存在'
        });
      }

      // 检查权限（只有作者或管理员可以修改）
      if (existingPost.authorId !== userId && userRole !== 'admin') {
        return res.status(403).json({
          error: '无权修改此文章'
        });
      }

      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: '输入验证失败',
          details: errors.array()
        });
      }

      const { title, content, category, tags, featuredImage, status } = req.body;

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (category !== undefined) updateData.category = category;
      if (tags !== undefined) updateData.tags = tags;
      if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'published') {
          updateData.publishedAt = new Date().toISOString();
        }
      }

      const updatedPost = await updateOne(POSTS_COLLECTION, 
        { id: parseInt(id) }, 
        updateData
      );

      res.json({
        message: '文章更新成功',
        post: updatedPost
      });

    } catch (error) {
      console.error('更新文章错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 删除文章
  static async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // 查找现有文章
      const existingPost = await findOne(POSTS_COLLECTION, { id: parseInt(id) });
      if (!existingPost) {
        return res.status(404).json({
          error: '文章不存在'
        });
      }

      // 检查权限（只有作者或管理员可以删除）
      if (existingPost.authorId !== userId && userRole !== 'admin') {
        return res.status(403).json({
          error: '无权删除此文章'
        });
      }

      const deleted = await deleteOne(POSTS_COLLECTION, { id: parseInt(id) });

      if (!deleted) {
        return res.status(404).json({
          error: '文章删除失败'
        });
      }

      res.json({
        message: '文章删除成功'
      });

    } catch (error) {
      console.error('删除文章错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取用户的文章
  static async getUserPosts(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const posts = await findMany(POSTS_COLLECTION, 
        { 
          authorId: parseInt(userId),
          status: 'published'
        },
        {
          limit: parseInt(limit),
          offset: (page - 1) * limit,
          sort: { createdAt: 'desc' }
        }
      );

      const total = await countDocuments(POSTS_COLLECTION, 
        { 
          authorId: parseInt(userId),
          status: 'published'
        }
      );

      res.json({
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('获取用户文章错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 增加文章浏览量
  static async incrementViewCount(req, res) {
    try {
      const { id } = req.params;
      const post = await findOne(POSTS_COLLECTION, { id: parseInt(id) });

      if (!post) {
        return res.status(404).json({
          error: '文章不存在'
        });
      }

      const updatedPost = await updateOne(POSTS_COLLECTION, 
        { id: parseInt(id) },
        { viewCount: (post.viewCount || 0) + 1 }
      );

      res.json({ viewCount: updatedPost.viewCount });

    } catch (error) {
      console.error('增加浏览量错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }
}

module.exports = PostController;