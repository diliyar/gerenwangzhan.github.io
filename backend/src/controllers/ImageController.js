const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { 
  findMany, 
  findOne, 
  insertOne, 
  deleteOne 
} = require('../utils/database');

const IMAGES_COLLECTION = 'images';

// 配置Multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/gif,image/webp').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

class ImageController {

  // 图片上传
  static async uploadImage(req, res) {
    try {
      const uploadSingle = upload.single('image');
      
      uploadSingle(req, res, async (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              error: '文件大小超出限制'
            });
          }
          if (err.message === '不支持的文件类型') {
            return res.status(400).json({
              error: '不支持的文件类型'
            });
          }
          return res.status(400).json({
            error: err.message
          });
        }

        if (!req.file) {
          return res.status(400).json({
            error: '请选择要上传的图片'
          });
        }

        const { title, description, category = 'general' } = req.body;
        const uploadedBy = req.user ? req.user.id : null;

        const imageData = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          title: title || req.file.originalname,
          description: description || '',
          category,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/${req.file.filename}`,
          uploadedBy,
          url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        };

        const savedImage = await insertOne(IMAGES_COLLECTION, imageData);

        res.status(201).json({
          message: '图片上传成功',
          image: savedImage
        });
      });

    } catch (error) {
      console.error('图片上传错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取图片列表
  static async getImages(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category,
        search 
      } = req.query;

      const offset = (page - 1) * limit;
      const filter = {};

      if (category) filter.category = category;
      
      let images = await findMany(IMAGES_COLLECTION, filter, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        sort: { createdAt: 'desc' }
      });

      // 如果有搜索条件，进行本地过滤
      if (search) {
        images = images.filter(image => 
          image.title.toLowerCase().includes(search.toLowerCase()) ||
          (image.description && image.description.toLowerCase().includes(search.toLowerCase()))
        );
      }

      // 获取总数
      const totalImages = await findMany(IMAGES_COLLECTION, filter);
      const total = search ? images.length : totalImages.length;

      res.json({
        images,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('获取图片列表错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取单张图片
  static async getImage(req, res) {
    try {
      const { id } = req.params;
      const image = await findOne(IMAGES_COLLECTION, { id: parseInt(id) });

      if (!image) {
        return res.status(404).json({
          error: '图片不存在'
        });
      }

      res.json({ image });

    } catch (error) {
      console.error('获取图片错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 删除图片
  static async deleteImage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // 查找图片
      const image = await findOne(IMAGES_COLLECTION, { id: parseInt(id) });
      if (!image) {
        return res.status(404).json({
          error: '图片不存在'
        });
      }

      // 检查权限（只有上传者或管理员可以删除）
      if (image.uploadedBy !== userId && userRole !== 'admin') {
        return res.status(403).json({
          error: '无权删除此图片'
        });
      }

      // 删除物理文件
      const filePath = path.join(__dirname, '../../uploads', image.filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('删除物理文件失败:', error.message);
      }

      // 删除数据库记录
      const deleted = await deleteOne(IMAGES_COLLECTION, { id: parseInt(id) });

      if (!deleted) {
        return res.status(404).json({
          error: '图片删除失败'
        });
      }

      res.json({
        message: '图片删除成功'
      });

    } catch (error) {
      console.error('删除图片错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取图片分类统计
  static async getImageStats(req, res) {
    try {
      const images = await findMany(IMAGES_COLLECTION, {}, {});
      
      const stats = {
        total: images.length,
        categories: {},
        totalSize: 0
      };

      images.forEach(image => {
        // 分类统计
        stats.categories[image.category] = (stats.categories[image.category] || 0) + 1;
        // 总大小统计
        stats.totalSize += image.size || 0;
      });

      res.json({ stats });

    } catch (error) {
      console.error('获取图片统计错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 批量删除图片
  static async deleteMultipleImages(req, res) {
    try {
      const { imageIds } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        return res.status(400).json({
          error: '请提供要删除的图片ID列表'
        });
      }

      const allImages = await findMany(IMAGES_COLLECTION, {}, {});
      const images = allImages.filter(img => imageIds.includes(img.id));
      const deletedImages = [];
      const failedImages = [];

      for (const image of images) {
        try {
          // 检查权限
          if (image.uploadedBy !== userId && userRole !== 'admin') {
            failedImages.push({ id: image.id, reason: '无权删除' });
            continue;
          }

          // 删除物理文件
          const filePath = path.join(__dirname, '../../uploads', image.filename);
          try {
            await fs.unlink(filePath);
          } catch (error) {
            console.warn('删除物理文件失败:', error.message);
          }

          // 删除数据库记录
          const deleted = await deleteOne(IMAGES_COLLECTION, { id: image.id });
          if (deleted) {
            deletedImages.push(image.id);
          } else {
            failedImages.push({ id: image.id, reason: '数据库删除失败' });
          }

        } catch (error) {
          failedImages.push({ id: image.id, reason: error.message });
        }
      }

      res.json({
        message: `成功删除 ${deletedImages.length} 张图片`,
        deletedImages,
        failedImages
      });

    } catch (error) {
      console.error('批量删除图片错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }
}

module.exports = {
  ImageController,
  upload
};