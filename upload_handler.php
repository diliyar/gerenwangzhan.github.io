<?php
// 设置响应头
header('Content-Type: application/json');

// 允许的图像类型
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxFileSize = 5 * 1024 * 1024; // 5MB

// 检查是否收到POST请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => '仅支持POST请求']);
    exit;
}

// 检查是否有文件上传
if (!isset($_FILES['image'])) {
    echo json_encode(['success' => false, 'message' => '没有接收到文件']);
    exit;
}

$file = $_FILES['image'];

// 检查上传错误
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessage = '文件上传失败: ';
    switch ($file['error']) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $errorMessage .= '文件太大';
            break;
        case UPLOAD_ERR_PARTIAL:
            $errorMessage .= '文件仅部分上传';
            break;
        case UPLOAD_ERR_NO_FILE:
            $errorMessage .= '没有选择文件';
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            $errorMessage .= '服务器临时目录丢失';
            break;
        case UPLOAD_ERR_CANT_WRITE:
            $errorMessage .= '文件写入失败';
            break;
        case UPLOAD_ERR_EXTENSION:
            $errorMessage .= 'PHP扩展阻止了文件上传';
            break;
        default:
            $errorMessage .= '未知错误';
            break;
    }
    echo json_encode(['success' => false, 'message' => $errorMessage]);
    exit;
}

// 检查文件大小
if ($file['size'] > $maxFileSize) {
    echo json_encode(['success' => false, 'message' => '文件大小超过5MB限制']);
    exit;
}

// 检查文件类型
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => '仅支持JPEG、PNG、GIF和WebP格式的图片']);
    exit;
}

// 验证文件内容以防止伪装的文件
$imageInfo = getimagesize($file['tmp_name']);
if (!$imageInfo || !in_array($imageInfo['mime'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => '无效的图片文件']);
    exit;
}

// 获取文件扩展名
$fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);

// 生成唯一文件名
$fileName = 'uploaded_' . time() . '.' . $fileExtension;

// 设置目标路径
$targetDir = dirname(__FILE__) . '/images/';
$targetPath = $targetDir . $fileName;

// 检查images目录是否存在，如果不存在则创建
if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0755, true)) {
        echo json_encode(['success' => false, 'message' => '无法创建上传目录']);
        exit;
    }
}

// 移动上传的文件
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // 获取图片尺寸
    $dimensions = getimagesize($targetPath);
    $width = $dimensions[0];
    $height = $dimensions[1];
    
    // 返回成功响应
    echo json_encode([
        'success' => true, 
        'message' => '文件上传成功',
        'file' => [
            'name' => $file['name'],
            'fileName' => $fileName,
            'size' => $file['size'],
            'type' => $file['type'],
            'dimensions' => ['width' => $width, 'height' => $height],
            'url' => 'images/' . $fileName
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => '文件移动失败']);
}
?>