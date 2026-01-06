// 管理后台主要JavaScript逻辑 - 纯前端版本

// 全局变量
let currentUser = null;
let currentSection = 'dashboard';
let posts = [];
let images = [];
let users = [];
let categories = [];

// localStorage数据库名称
const DB_NAME = 'personal_blog_db';

// 初始化数据库
function initDatabase() {
    // 初始化管理员账户
    if (!localStorage.getItem(DB_NAME)) {
        const initialData = {
            users: [
                {
                    id: generateId(),
                    username: 'admin',
                    email: 'admin@blog.com',
                    password: 'admin123',
                    fullName: '系统管理员',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                }
            ],
            posts: [],
            images: [],
            categories: [
                { id: generateId(), name: '成长经历', slug: 'growth', createdAt: new Date().toISOString() },
                { id: generateId(), name: '游戏生涯', slug: 'gaming', createdAt: new Date().toISOString() },
                { id: generateId(), name: '兴趣爱好', slug: 'interests', createdAt: new Date().toISOString() },
                { id: generateId(), name: '摄影作品', slug: 'photography', createdAt: new Date().toISOString() }
            ],
            settings: {
                siteName: '迪力亚尔的个人博客',
                siteDescription: '这是一个个人博客网站',
                postsPerPage: 6,
                allowComments: true
            }
        };
        localStorage.setItem(DB_NAME, JSON.stringify(initialData));
    }
}

// 获取数据库数据
function getDB() {
    const data = localStorage.getItem(DB_NAME);
    return data ? JSON.parse(data) : null;
}

// 保存数据库数据
function saveDB(data) {
    localStorage.setItem(DB_NAME, JSON.stringify(data));
}

// 生成唯一ID
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 工具函数
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) {
        console.log(`Toast: ${message} (${type})`);
        return;
    }
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
}

function getStatusBadge(status) {
    return `<span class="status-badge status-${status}">${status === 'published' ? '已发布' : '草稿'}</span>`;
}

function getCategoryName(categorySlug) {
    const db = getDB();
    if (!db) return categorySlug;
    const category = db.categories.find(c => c.slug === categorySlug);
    return category ? category.name : categorySlug;
}

// 登录相关
function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginPage) loginPage.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
    localStorage.removeItem('currentUser');
}

function showAdminDashboard() {
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginPage) loginPage.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
    loadDashboardData();
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const db = getDB();
    if (!db) {
        showToast('数据库未初始化', 'error');
        return;
    }
    
    // 查找用户
    const user = db.users.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        const userDisplay = document.getElementById('current-user');
        if (userDisplay) {
            userDisplay.textContent = user.fullName || user.username;
        }
        
        showAdminDashboard();
        showToast('登录成功');
    } else {
        showToast('用户名或密码不正确', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginPage();
    showToast('已退出登录');
}

// 导航相关
function switchSection(sectionName) {
    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // 显示对应内容
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }
    
    currentSection = sectionName;
    
    // 加载对应数据
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'images':
            loadImages();
            break;
        case 'users':
            loadUsers();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// 仪表盘数据加载
function loadDashboardData() {
    const db = getDB();
    if (!db) return;
    
    // 更新统计卡片
    const totalUsers = document.getElementById('total-users');
    const totalPosts = document.getElementById('total-posts');
    const totalImages = document.getElementById('total-images');
    const todayViews = document.getElementById('today-views');
    
    if (totalUsers) totalUsers.textContent = db.users.length;
    if (totalPosts) totalPosts.textContent = db.posts.length;
    if (totalImages) totalImages.textContent = db.images.length;
    if (todayViews) todayViews.textContent = Math.floor(Math.random() * 100) + 50; // 模拟今日访问
    
    // 更新最近活动
    const recentPostsContainer = document.getElementById('recent-posts');
    if (recentPostsContainer) {
        recentPostsContainer.innerHTML = '';
        
        const recentPosts = db.posts.slice(-5).reverse();
        
        if (recentPosts.length === 0) {
            recentPostsContainer.innerHTML = '<div class="activity-item"><div class="activity-content"><div class="activity-title">暂无文章</div></div></div>';
        } else {
            recentPosts.forEach(post => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-content">
                        <div class="activity-title">${post.title}</div>
                        <div class="activity-time">${formatDate(post.createdAt)}</div>
                    </div>
                    <div class="activity-status">
                        ${getStatusBadge(post.status)}
                    </div>
                `;
                recentPostsContainer.appendChild(activityItem);
            });
        }
    }
}

// 文章管理
function loadPosts() {
    const db = getDB();
    if (!db) return;
    
    posts = db.posts || [];
    renderPostsTable();
}

function renderPostsTable() {
    const tbody = document.querySelector('#posts-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">暂无文章</td></tr>';
        return;
    }
    
    posts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="post-checkbox" value="${post.id}"></td>
            <td>${post.title}</td>
            <td>${getCategoryName(post.category)}</td>
            <td>${getStatusBadge(post.status)}</td>
            <td>管理员</td>
            <td>${formatDate(post.createdAt)}</td>
            <td>
                <button class="btn-secondary" onclick="editPost('${post.id}')">编辑</button>
                <button class="btn-danger" onclick="deletePost('${post.id}')">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 显示编辑模态框
    showModal(`
        <h3>编辑文章</h3>
        <form id="edit-post-form">
            <div class="form-group">
                <label for="edit-title">标题</label>
                <input type="text" id="edit-title" name="title" value="${post.title}" required>
            </div>
            <div class="form-group">
                <label for="edit-category">分类</label>
                <select id="edit-category" name="category" required>
                    <option value="growth" ${post.category === 'growth' ? 'selected' : ''}>成长经历</option>
                    <option value="gaming" ${post.category === 'gaming' ? 'selected' : ''}>游戏生涯</option>
                    <option value="interests" ${post.category === 'interests' ? 'selected' : ''}>兴趣爱好</option>
                    <option value="photography" ${post.category === 'photography' ? 'selected' : ''}>摄影作品</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-status">状态</label>
                <select id="edit-status" name="status" required>
                    <option value="published" ${post.status === 'published' ? 'selected' : ''}>已发布</option>
                    <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>草稿</option>
                </select>
            </div>
            <div class="form-group">
                <label for="edit-content">内容</label>
                <textarea id="edit-content" name="content" rows="10" required>${post.content || ''}</textarea>
            </div>
            <button type="submit" class="btn-primary">保存修改</button>
        </form>
    `);
    
    // 处理表单提交
    document.getElementById('edit-post-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleUpdatePost(postId);
    });
}

function handleUpdatePost(postId) {
    const db = getDB();
    if (!db) return;
    
    const postIndex = db.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    
    db.posts[postIndex] = {
        ...db.posts[postIndex],
        title: document.getElementById('edit-title').value,
        category: document.getElementById('edit-category').value,
        status: document.getElementById('edit-status').value,
        content: document.getElementById('edit-content').value,
        updatedAt: new Date().toISOString()
    };
    
    saveDB(db);
    posts = db.posts;
    
    closeModal();
    renderPostsTable();
    showToast('文章更新成功');
}

function deletePost(postId) {
    if (!confirm('确定要删除这篇文章吗？')) return;
    
    const db = getDB();
    if (!db) return;
    
    db.posts = db.posts.filter(p => p.id !== postId);
    saveDB(db);
    posts = db.posts;
    
    renderPostsTable();
    showToast('文章删除成功');
}

function createNewPost() {
    showModal(`
        <h3>新建文章</h3>
        <form id="new-post-form">
            <div class="form-group">
                <label for="new-title">标题</label>
                <input type="text" id="new-title" name="title" required>
            </div>
            <div class="form-group">
                <label for="new-category">分类</label>
                <select id="new-category" name="category" required>
                    <option value="growth">成长经历</option>
                    <option value="gaming">游戏生涯</option>
                    <option value="interests">兴趣爱好</option>
                    <option value="photography">摄影作品</option>
                </select>
            </div>
            <div class="form-group">
                <label for="new-status">状态</label>
                <select id="new-status" name="status" required>
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                </select>
            </div>
            <div class="form-group">
                <label for="new-content">内容</label>
                <textarea id="new-content" name="content" rows="10" required></textarea>
            </div>
            <button type="submit" class="btn-primary">创建文章</button>
        </form>
    `);
    
    document.getElementById('new-post-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleCreatePost();
    });
}

function handleCreatePost() {
    const db = getDB();
    if (!db) return;
    
    const newPost = {
        id: generateId(),
        title: document.getElementById('new-title').value,
        category: document.getElementById('new-category').value,
        status: document.getElementById('new-status').value,
        content: document.getElementById('new-content').value,
        authorId: currentUser?.id || 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    db.posts.push(newPost);
    saveDB(db);
    posts = db.posts;
    
    closeModal();
    renderPostsTable();
    showToast('文章创建成功');
}

// 图片管理
function loadImages() {
    const db = getDB();
    if (!db) return;
    
    images = db.images || [];
    renderImagesGrid();
}

function renderImagesGrid() {
    const grid = document.getElementById('images-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (images.length === 0) {
        grid.innerHTML = '<div class="no-images">暂无图片，点击上传按钮添加图片</div>';
        return;
    }
    
    images.forEach(image => {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.innerHTML = `
            <img src="${image.data}" alt="${image.name}">
            <div class="image-overlay">
                <span class="image-name">${image.name}</span>
                <button class="btn-danger btn-sm" onclick="deleteImage('${image.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(item);
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件', 'error');
        return;
    }
    
    // 验证文件大小 (最大5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const db = getDB();
        if (!db) return;
        
        const newImage = {
            id: generateId(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target.result,
            category: 'uploaded',
            createdAt: new Date().toISOString()
        };
        
        db.images.push(newImage);
        saveDB(db);
        images = db.images;
        
        renderImagesGrid();
        showToast('图片上传成功');
    };
    
    reader.onerror = function() {
        showToast('图片读取失败', 'error');
    };
    
    reader.readAsDataURL(file);
}

function deleteImage(imageId) {
    if (!confirm('确定要删除这张图片吗？')) return;
    
    const db = getDB();
    if (!db) return;
    
    db.images = db.images.filter(i => i.id !== imageId);
    saveDB(db);
    images = db.images;
    
    renderImagesGrid();
    showToast('图片删除成功');
}

// 用户管理
function loadUsers() {
    const db = getDB();
    if (!db) return;
    
    users = db.users || [];
    renderUsersTable();
}

function renderUsersTable() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.fullName || '-'}</td>
            <td>${user.role === 'admin' ? '管理员' : '用户'}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                ${user.role !== 'admin' ? `<button class="btn-danger" onclick="deleteUser('${user.id}')">删除</button>` : '-'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteUser(userId) {
    if (!confirm('确定要删除这个用户吗？')) return;
    
    const db = getDB();
    if (!db) return;
    
    db.users = db.users.filter(u => u.id !== userId);
    saveDB(db);
    users = db.users;
    
    renderUsersTable();
    showToast('用户删除成功');
}

// 分类管理
function loadCategories() {
    const db = getDB();
    if (!db) return;
    
    categories = db.categories || [];
    renderCategoriesTable();
}

function renderCategoriesTable() {
    const tbody = document.querySelector('#categories-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.slug}</td>
            <td>${formatDate(category.createdAt)}</td>
            <td>
                <button class="btn-danger" onclick="deleteCategory('${category.id}')">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function createNewCategory() {
    showModal(`
        <h3>新建分类</h3>
        <form id="new-category-form">
            <div class="form-group">
                <label for="category-name">分类名称</label>
                <input type="text" id="category-name" name="name" required>
            </div>
            <div class="form-group">
                <label for="category-slug">分类别名</label>
                <input type="text" id="category-slug" name="slug" required>
            </div>
            <button type="submit" class="btn-primary">创建分类</button>
        </form>
    `);
    
    document.getElementById('new-category-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleCreateCategory();
    });
}

function handleCreateCategory() {
    const db = getDB();
    if (!db) return;
    
    const newCategory = {
        id: generateId(),
        name: document.getElementById('category-name').value,
        slug: document.getElementById('category-slug').value,
        createdAt: new Date().toISOString()
    };
    
    db.categories.push(newCategory);
    saveDB(db);
    categories = db.categories;
    
    closeModal();
    renderCategoriesTable();
    showToast('分类创建成功');
}

function deleteCategory(categoryId) {
    if (!confirm('确定要删除这个分类吗？')) return;
    
    const db = getDB();
    if (!db) return;
    
    db.categories = db.categories.filter(c => c.id !== categoryId);
    saveDB(db);
    categories = db.categories;
    
    renderCategoriesTable();
    showToast('分类删除成功');
}

// 系统设置
function loadSettings() {
    const db = getDB();
    if (!db) return;
    
    const settings = db.settings;
    
    const siteName = document.getElementById('site-name');
    const siteDescription = document.getElementById('site-description');
    const postsPerPage = document.getElementById('posts-per-page');
    
    if (siteName) siteName.value = settings.siteName || '';
    if (siteDescription) siteDescription.value = settings.siteDescription || '';
    if (postsPerPage) postsPerPage.value = settings.postsPerPage || 6;
}

function saveSettings() {
    const db = getDB();
    if (!db) return;
    
    db.settings = {
        siteName: document.getElementById('site-name').value,
        siteDescription: document.getElementById('site-description').value,
        postsPerPage: parseInt(document.getElementById('posts-per-page').value) || 6
    };
    
    saveDB(db);
    showToast('设置保存成功');
}

// 模态框相关
function showModal(content) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    
    if (modal && modalContent) {
        modalContent.innerHTML = content;
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据库
    initDatabase();
    
    // 检查是否已登录
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        const userDisplay = document.getElementById('current-user');
        if (userDisplay) {
            userDisplay.textContent = currentUser.fullName || currentUser.username;
        }
        showAdminDashboard();
    } else {
        showLoginPage();
    }
    
    // 绑定导航点击事件
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }
        });
    });
    
    // 绑定登录表单
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 绑定退出按钮
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 绑定新建文章按钮
    const newPostBtn = document.getElementById('new-post-btn');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', createNewPost);
    }
    
    // 绑定新建分类按钮
    const newCategoryBtn = document.getElementById('new-category-btn');
    if (newCategoryBtn) {
        newCategoryBtn.addEventListener('click', createNewCategory);
    }
    
    // 绑定图片上传
    const imageUpload = document.getElementById('image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
    
    // 绑定设置保存
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    // 关闭模态框
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('modal');
        if (modal && e.target === modal) {
            closeModal();
        }
    });
    
    // 批量删除文章
    const deleteSelectedPostsBtn = document.getElementById('delete-selected-posts');
    if (deleteSelectedPostsBtn) {
        deleteSelectedPostsBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.post-checkbox:checked');
            const ids = Array.from(checkboxes).map(cb => cb.value);
            
            if (ids.length === 0) {
                showToast('请先选择要删除的文章', 'error');
                return;
            }
            
            if (!confirm(`确定要删除选中的 ${ids.length} 篇文章吗？`)) return;
            
            const db = getDB();
            if (!db) return;
            
            db.posts = db.posts.filter(p => !ids.includes(p.id));
            saveDB(db);
            posts = db.posts;
            
            renderPostsTable();
            showToast(`成功删除 ${ids.length} 篇文章`);
        });
    }
});
