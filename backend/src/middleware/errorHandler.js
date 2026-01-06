const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 默认错误
  let error = {
    message: '服务器内部错误',
    status: 500
  };

  // 处理Multer错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = '文件大小超出限制';
    error.status = 400;
  }

  // 处理验证错误
  if (err.name === 'ValidationError') {
    error.message = '输入验证失败';
    error.status = 400;
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    error.message = '访问令牌无效';
    error.status = 403;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = '访问令牌已过期';
    error.status = 403;
  }

  // 处理Cast错误（无效ID）
  if (err.name === 'CastError') {
    error.message = '无效的ID格式';
    error.status = 400;
  }

  // 处理数据库错误
  if (err.code === 'ENOENT') {
    error.message = '文件或目录不存在';
    error.status = 404;
  }

  // 处理权限错误
  if (err.code === 'EACCES') {
    error.message = '权限不足';
    error.status = 403;
  }

  // 在开发环境中返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    error.details = err.message;
    error.stack = err.stack;
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { details: error.details, stack: error.stack })
  });
};

// 404处理
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: '请求的资源不存在'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};