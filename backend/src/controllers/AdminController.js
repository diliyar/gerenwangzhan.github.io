const { 
  findMany, 
  findOne, 
  insertOne, 
  updateOne, 
  deleteOne,
  countDocuments 
} = require('../utils/database');

class AdminController {

  // 获取仪表盘统计信息
  static async getDashboardStats(req, res) {
    try {
      const [
        totalUsers,
        totalPosts,
        totalImages,
        publishedPosts,
        draftPosts,
        recentPosts,
        recentImages
      ] = await Promise.all([
        countDocuments('users'),
        countDocuments('posts'),
        countDocuments('images'),
        countDocuments('posts', { status: 'published' }),
        countDocuments('posts', { status: 'draft' }),
        findMany('posts', {}, { limit: 5, sort: { createdAt: 'desc' } }),
        findMany('images', {}, { limit: 5, sort: { createdAt: 'desc' } })
      ]);

      // 计算今日统计
      const today = new Date().toISOString().split('T')[0];
      const todayUsers = await findMany('users', {}, {});
      const todayPosts = await findMany('posts', {}, {});
      
      const todayUserCount = todayUsers.filter(user => 
        user.createdAt && user.createdAt.startsWith(today)
      ).length;
      
      const todayPostCount = todayPosts.filter(post => 
        post.createdAt && post.createdAt.startsWith(today)
      ).length;

      res.json({
        stats: {
          users: {
            total: totalUsers,
            today: todayUserCount
          },
          posts: {
            total: totalPosts,
            published: publishedPosts,
            draft: draftPosts,
            today: todayPostCount
          },
          images: {
            total: totalImages
          }
        },
        recentActivity: {
          recentPosts: recentPosts.map(post => ({
            id: post.id,
            title: post.title,
            status: post.status,
            createdAt: post.createdAt,
            authorId: post.authorId
          })),
          recentImages: recentImages.map(image => ({
            id: image.id,
            title: image.title,
            category: image.category,
            createdAt: image.createdAt,
            uploadedBy: image.uploadedBy
          }))
        }
      });

    } catch (error) {
      console.error('获取仪表盘统计错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取所有用户列表
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, role } = req.query;
      const offset = (page - 1) * limit;

      let users = await findMany('users', {}, {
        sort: { createdAt: 'desc' }
      });

      // 筛选条件
      if (search) {
        users = users.filter(user => 
          user.username.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase()))
        );
      }

      if (role) {
        users = users.filter(user => user.role === role);
      }

      // 分页
      const total = users.length;
      const paginatedUsers = users.slice(offset, offset + parseInt(limit));

      // 移除敏感信息
      const usersResponse = paginatedUsers.map(user => {
        const { password, ...userResponse } = user;
        return userResponse;
      });

      res.json({
        users: usersResponse,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 更新用户状态
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive, role } = req.body;

      if (req.user.id === parseInt(id)) {
        return res.status(400).json({
          error: '不能修改自己的状态'
        });
      }

      const updateData = {};
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      if (role) updateData.role = role;

      const updatedUser = await updateOne('users', 
        { id: parseInt(id) }, 
        updateData
      );

      if (!updatedUser) {
        return res.status(404).json({
          error: '用户不存在'
        });
      }

      const { password: _, ...userResponse } = updatedUser;

      res.json({
        message: '用户状态更新成功',
        user: userResponse
      });

    } catch (error) {
      console.error('更新用户状态错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 删除用户
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (req.user.id === parseInt(id)) {
        return res.status(400).json({
          error: '不能删除自己的账户'
        });
      }

      // 检查用户是否存在
      const user = await findOne('users', { id: parseInt(id) });
      if (!user) {
        return res.status(404).json({
          error: '用户不存在'
        });
      }

      // 删除用户
      const deleted = await deleteOne('users', { id: parseInt(id) });

      if (!deleted) {
        return res.status(404).json({
          error: '用户删除失败'
        });
      }

      res.json({
        message: '用户删除成功'
      });

    } catch (error) {
      console.error('删除用户错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取所有文章（包括草稿）
  static async getAllPosts(req, res) {
    try {
      const { page = 1, limit = 20, status, category } = req.query;
      const offset = (page - 1) * limit;

      let posts = await findMany('posts', {}, {
        sort: { createdAt: 'desc' }
      });

      // 筛选条件
      if (status) {
        posts = posts.filter(post => post.status === status);
      }

      if (category) {
        posts = posts.filter(post => post.category === category);
      }

      // 分页
      const total = posts.length;
      const paginatedPosts = posts.slice(offset, offset + parseInt(limit));

      res.json({
        posts: paginatedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('获取所有文章错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 批量更新文章状态
  static async batchUpdatePostStatus(req, res) {
    try {
      const { postIds, status } = req.body;

      if (!Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({
          error: '请提供要更新的文章ID列表'
        });
      }

      if (!['published', 'draft'].includes(status)) {
        return res.status(400).json({
          error: '无效的文章状态'
        });
      }

      const allPosts = await findMany('posts', {}, {});
      const posts = allPosts.filter(post => postIds.includes(post.id));
      
      let updatedCount = 0;
      const failedPosts = [];

      for (const post of posts) {
        try {
          const updatedPost = await updateOne('posts', 
            { id: post.id }, 
            { 
              status,
              publishedAt: status === 'published' ? new Date().toISOString() : post.publishedAt
            }
          );
          
          if (updatedPost) {
            updatedCount++;
          } else {
            failedPosts.push(post.id);
          }
        } catch (error) {
          failedPosts.push(post.id);
        }
      }

      res.json({
        message: `成功更新 ${updatedCount} 篇文章状态`,
        updatedCount,
        failedPosts
      });

    } catch (error) {
      console.error('批量更新文章状态错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 批量删除文章
  static async batchDeletePosts(req, res) {
    try {
      const { postIds } = req.body;

      if (!Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({
          error: '请提供要删除的文章ID列表'
        });
      }

      const allPosts = await findMany('posts', {}, {});
      const posts = allPosts.filter(post => postIds.includes(post.id));
      
      let deletedCount = 0;
      const failedPosts = [];

      for (const post of posts) {
        try {
          const deleted = await deleteOne('posts', { id: post.id });
          if (deleted) {
            deletedCount++;
          } else {
            failedPosts.push(post.id);
          }
        } catch (error) {
          failedPosts.push(post.id);
        }
      }

      res.json({
        message: `成功删除 ${deletedCount} 篇文章`,
        deletedCount,
        failedPosts
      });

    } catch (error) {
      console.error('批量删除文章错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取系统设置
  static async getSystemSettings(req, res) {
    try {
      // 这里可以从数据库或配置文件读取系统设置
      // 目前返回一些基本设置
      const settings = {
        siteName: '迪力亚尔的个人博客',
        siteDescription: '分享成长经历、游戏生涯和兴趣爱好',
        allowRegistration: true,
        maxUploadSize: 10, // MB
        allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      };

      res.json({ settings });

    } catch (error) {
      console.error('获取系统设置错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 更新系统设置
  static async updateSystemSettings(req, res) {
    try {
      const { siteName, siteDescription, allowRegistration, maxUploadSize } = req.body;

      // 这里应该将设置保存到数据库
      // 目前只是返回更新成功的信息
      const updatedSettings = {
        siteName: siteName || '迪力亚尔的个人博客',
        siteDescription: siteDescription || '分享成长经历、游戏生涯和兴趣爱好',
        allowRegistration: allowRegistration !== undefined ? allowRegistration : true,
        maxUploadSize: maxUploadSize || 10,
        updatedAt: new Date().toISOString()
      };

      res.json({
        message: '系统设置更新成功',
        settings: updatedSettings
      });

    } catch (error) {
      console.error('更新系统设置错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取分类管理
  static async getCategories(req, res) {
    try {
      const categories = await findMany('categories', {}, {
        sort: { id: 'asc' }
      });

      res.json({ categories });

    } catch (error) {
      console.error('获取分类列表错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 创建分类
  static async createCategory(req, res) {
    try {
      const { name, slug, description } = req.body;

      if (!name || !slug) {
        return res.status(400).json({
          error: '分类名称和别名都是必需的'
        });
      }

      // 检查别名是否已存在
      const existingCategory = await findOne('categories', { slug });
      if (existingCategory) {
        return res.status(409).json({
          error: '分类别名已存在'
        });
      }

      const newCategory = {
        name,
        slug,
        description: description || '',
        postCount: 0
      };

      const createdCategory = await insertOne('categories', newCategory);

      res.status(201).json({
        message: '分类创建成功',
        category: createdCategory
      });

    } catch (error) {
      console.error('创建分类错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 更新分类
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, slug, description } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;

      const updatedCategory = await updateOne('categories', 
        { id: parseInt(id) }, 
        updateData
      );

      if (!updatedCategory) {
        return res.status(404).json({
          error: '分类不存在'
        });
      }

      res.json({
        message: '分类更新成功',
        category: updatedCategory
      });

    } catch (error) {
      console.error('更新分类错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 删除分类
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      // 检查是否有文章使用此分类
      const postsWithCategory = await findMany('posts', { category: id.toString() }, {});
      if (postsWithCategory.length > 0) {
        return res.status(400).json({
          error: '无法删除，有文章正在使用此分类'
        });
      }

      const deleted = await deleteOne('categories', { id: parseInt(id) });

      if (!deleted) {
        return res.status(404).json({
          error: '分类不存在'
        });
      }

      res.json({
        message: '分类删除成功'
      });

    } catch (error) {
      console.error('删除分类错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }
}

module.exports = AdminController;