const fs = require('fs').promises;
const path = require('path');

const DB_PATH = process.env.DB_PATH || './data/database.json';

const DEFAULT_DATA = {
  users: [],
  posts: [],
  images: [],
  categories: [
    { id: 1, name: '成长经历', slug: 'growth' },
    { id: 2, name: '游戏生涯', slug: 'gaming' },
    { id: 3, name: '兴趣爱好', slug: 'interests' },
    { id: 4, name: '摄影作品', slug: 'photography' }
  ]
};

let dbCache = null;

async function initializeDatabase() {
  try {
    const dbDir = path.dirname(DB_PATH);
    
    // 确保数据目录存在
    try {
      await fs.access(dbDir);
    } catch {
      await fs.mkdir(dbDir, { recursive: true });
    }

    // 确保数据库文件存在
    try {
      await fs.access(DB_PATH);
      console.log('📁 数据库文件已存在');
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
      console.log('✅ 数据库文件已创建');
    }

    // 加载初始数据
    await loadDatabase();
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

async function loadDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    dbCache = JSON.parse(data);
    console.log('📖 数据库已加载');
  } catch (error) {
    console.error('❌ 数据库加载失败:', error);
    dbCache = { ...DEFAULT_DATA };
    await saveDatabase();
  }
}

async function saveDatabase() {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(dbCache, null, 2));
    console.log('💾 数据库已保存');
  } catch (error) {
    console.error('❌ 数据库保存失败:', error);
    throw error;
  }
}

async function getCollection(collectionName) {
  if (!dbCache) {
    await loadDatabase();
  }
  
  if (!dbCache[collectionName]) {
    dbCache[collectionName] = [];
    await saveDatabase();
  }
  
  return dbCache[collectionName];
}

async function setCollection(collectionName, data) {
  if (!dbCache) {
    await loadDatabase();
  }
  
  dbCache[collectionName] = data;
  await saveDatabase();
}

async function findOne(collectionName, filter = {}) {
  const collection = await getCollection(collectionName);
  
  for (const item of collection) {
    let matches = true;
    
    for (const [key, value] of Object.entries(filter)) {
      if (item[key] !== value) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      return item;
    }
  }
  
  return null;
}

async function findMany(collectionName, filter = {}, options = {}) {
  const collection = await getCollection(collectionName);
  let results = collection.filter(item => {
    for (const [key, value] of Object.entries(filter)) {
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });

  // 分页
  if (options.limit) {
    const start = options.offset || 0;
    results = results.slice(start, start + options.limit);
  }

  // 排序
  if (options.sort) {
    const [field, direction] = Object.entries(options.sort)[0];
    results.sort((a, b) => {
      if (direction === 'desc') {
        return b[field] - a[field];
      }
      return a[field] - b[field];
    });
  }

  return results;
}

async function insertOne(collectionName, document) {
  const collection = await getCollection(collectionName);
  
  // 生成ID
  const maxId = collection.reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, 0);
  
  document.id = maxId + 1;
  document.createdAt = new Date().toISOString();
  document.updatedAt = new Date().toISOString();
  
  collection.push(document);
  await setCollection(collectionName, collection);
  
  return document;
}

async function updateOne(collectionName, filter, update) {
  const collection = await getCollection(collectionName);
  let updated = false;
  
  for (let i = 0; i < collection.length; i++) {
    let matches = true;
    
    for (const [key, value] of Object.entries(filter)) {
      if (collection[i][key] !== value) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      collection[i] = { 
        ...collection[i], 
        ...update, 
        updatedAt: new Date().toISOString() 
      };
      updated = true;
      break;
    }
  }
  
  if (updated) {
    await setCollection(collectionName, collection);
    return collection.find(item => {
      for (const [key, value] of Object.entries(filter)) {
        if (item[key] !== value) return false;
      }
      return true;
    });
  }
  
  return null;
}

async function deleteOne(collectionName, filter) {
  const collection = await getCollection(collectionName);
  const originalLength = collection.length;
  
  const filteredCollection = collection.filter(item => {
    for (const [key, value] of Object.entries(filter)) {
      if (item[key] !== value) return false;
    }
    return true;
  });
  
  if (filteredCollection.length < originalLength) {
    await setCollection(collectionName, filteredCollection);
    return true;
  }
  
  return false;
}

async function countDocuments(collectionName, filter = {}) {
  const collection = await getCollection(collectionName);
  return collection.filter(item => {
    for (const [key, value] of Object.entries(filter)) {
      if (item[key] !== value) return false;
    }
    return true;
  }).length;
}

module.exports = {
  initializeDatabase,
  loadDatabase,
  saveDatabase,
  getCollection,
  setCollection,
  findOne,
  findMany,
  insertOne,
  updateOne,
  deleteOne,
  countDocuments
};