const bcrypt = require('bcryptjs');
const { insertOne } = require('../src/utils/database');

async function initializeAdminUser() {
    try {
        console.log('正在初始化管理员账户...');
        
        // 管理员账户信息
        const adminUser = {
            username: 'admin',
            email: 'admin@blog.com',
            password: 'admin123',
            fullName: '系统管理员',
            role: 'admin',
            isActive: true,
            avatar: null,
            bio: '系统默认管理员账户'
        };
        
        // 加密密码
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds);
        adminUser.password = hashedPassword;
        
        // 创建管理员账户
        const createdAdmin = await insertOne('users', adminUser);
        
        console.log('✅ 管理员账户创建成功');
        console.log('📧 用户名: admin');
        console.log('🔑 密码: admin123');
        console.log('📧 邮箱: admin@blog.com');
        
        // 创建一些示例文章
        const samplePosts = [
            {
                title: '欢迎来到迪力亚尔的个人博客',
                content: '欢迎大家来到我的个人博客！这里我将分享我的成长经历、游戏生涯和兴趣爱好。',
                category: 'growth',
                tags: ['欢迎', '介绍'],
                authorId: createdAdmin.id,
                status: 'published',
                viewCount: 0,
                likeCount: 0,
                publishedAt: new Date().toISOString()
            },
            {
                title: '我的CSGO游戏经历',
                content: '作为一名CSGO爱好者，我很喜欢Zywoo这位选手。让我们一起探讨CSGO的战术和技巧。',
                category: 'gaming',
                tags: ['CSGO', '游戏', 'Zywoo'],
                authorId: createdAdmin.id,
                status: 'published',
                viewCount: 0,
                likeCount: 0,
                publishedAt: new Date().toISOString()
            },
            {
                title: '健身与足球的完美结合',
                content: '健身和足球是我生活中不可缺少的两部分，它们帮助我保持健康和活力。',
                category: 'interests',
                tags: ['健身', '足球', '巴塞罗那'],
                authorId: createdAdmin.id,
                status: 'published',
                viewCount: 0,
                likeCount: 0,
                publishedAt: new Date().toISOString()
            }
        ];
        
        for (const post of samplePosts) {
            await insertOne('posts', post);
        }
        
        console.log('✅ 示例文章创建成功');
        
        // 创建一些示例分类
        const sampleCategories = [
            { name: '成长经历', slug: 'growth', description: '记录我的成长历程和重要经历' },
            { name: '游戏生涯', slug: 'gaming', description: '分享游戏经验和心得体会' },
            { name: '兴趣爱好', slug: 'interests', description: '展示我的兴趣爱好和生活态度' },
            { name: '摄影作品', slug: 'photography', description: '分享我的摄影作品和创作灵感' }
        ];
        
        for (const category of sampleCategories) {
            await insertOne('categories', category);
        }
        
        console.log('✅ 示例分类创建成功');
        console.log('🎉 数据库初始化完成！');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        process.exit(1);
    }
}

// 运行初始化
initializeAdminUser();