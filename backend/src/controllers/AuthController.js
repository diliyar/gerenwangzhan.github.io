const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { findOne, insertOne, updateOne, getCollection } = require('../utils/database');
const { generateToken } = require('../middleware/auth');

const USERS_COLLECTION = 'users';

// 用户注册验证规则
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少为6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个字母和一个数字'),
  body('fullName')
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名长度必须在2-50个字符之间')
];

// 用户登录验证规则
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

class AuthController {
  
  // 用户注册
  static async register(req, res) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: '输入验证失败',
          details: errors.array()
        });
      }

      const { username, email, password, fullName } = req.body;

      // 检查用户名是否已存在
      const existingUser = await findOne(USERS_COLLECTION, { username });
      if (existingUser) {
        return res.status(409).json({
          error: '用户名已存在'
        });
      }

      // 检查邮箱是否已存在
      const existingEmail = await findOne(USERS_COLLECTION, { email });
      if (existingEmail) {
        return res.status(409).json({
          error: '邮箱已被注册'
        });
      }

      // 加密密码
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const newUser = {
        username,
        email,
        password: hashedPassword,
        fullName,
        role: 'user',
        isActive: true,
        avatar: null,
        bio: null
      };

      const createdUser = await insertOne(USERS_COLLECTION, newUser);

      // 生成JWT令牌
      const token = generateToken(createdUser);

      // 返回用户信息（不包含密码）
      const { password: _, ...userResponse } = createdUser;
      
      res.status(201).json({
        message: '注册成功',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 用户登录
  static async login(req, res) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: '输入验证失败',
          details: errors.array()
        });
      }

      const { username, password } = req.body;

      // 查找用户（支持用户名或邮箱登录）
      const allUsers = await getCollection(USERS_COLLECTION);
      const user = allUsers.find(u => 
        u.username === username || u.email === username
      );

      if (!user) {
        return res.status(401).json({
          error: '用户名或密码错误'
        });
      }

      // 检查用户是否激活
      if (!user.isActive) {
        return res.status(401).json({
          error: '账户已被禁用'
        });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: '用户名或密码错误'
        });
      }

      // 更新最后登录时间
      await updateOne(USERS_COLLECTION, 
        { id: user.id },
        { lastLoginAt: new Date().toISOString() }
      );

      // 生成JWT令牌
      const token = generateToken(user);

      // 返回用户信息（不包含密码）
      const { password: _, ...userResponse } = user;
      
      res.json({
        message: '登录成功',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req, res) {
    try {
      const user = await findOne(USERS_COLLECTION, { id: req.user.id });
      
      if (!user) {
        return res.status(404).json({
          error: '用户不存在'
        });
      }

      const { password: _, ...userResponse } = user;
      
      res.json({
        user: userResponse
      });

    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 更新用户信息
  static async updateProfile(req, res) {
    try {
      const { fullName, bio, avatar } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (fullName !== undefined) updateData.fullName = fullName;
      if (bio !== undefined) updateData.bio = bio;
      if (avatar !== undefined) updateData.avatar = avatar;

      const updatedUser = await updateOne(USERS_COLLECTION, 
        { id: userId }, 
        updateData
      );

      if (!updatedUser) {
        return res.status(404).json({
          error: '用户不存在'
        });
      }

      const { password: _, ...userResponse } = updatedUser;
      
      res.json({
        message: '个人信息更新成功',
        user: userResponse
      });

    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }

  // 修改密码
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: '当前密码和新密码都是必需的'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: '新密码长度至少为6个字符'
        });
      }

      // 获取用户信息
      const user = await findOne(USERS_COLLECTION, { id: userId });
      if (!user) {
        return res.status(404).json({
          error: '用户不存在'
        });
      }

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: '当前密码错误'
        });
      }

      // 加密新密码
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // 更新密码
      await updateOne(USERS_COLLECTION, 
        { id: userId },
        { password: hashedNewPassword }
      );

      res.json({
        message: '密码修改成功'
      });

    } catch (error) {
      console.error('修改密码错误:', error);
      res.status(500).json({
        error: '服务器内部错误'
      });
    }
  }
}

module.exports = AuthController;