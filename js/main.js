document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initInterestsTabs();
    initGallery();
    initLightbox();
    initSmoothScroll();
    initImageUpload();
    loadUploadedImages();
});

function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stat-item, .info-item, .moment-card, .schedule-item, .fitness-stat, .gallery-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

function initInterestsTabs() {
    const tabs = document.querySelectorAll('.interest-tab');
    const contents = document.querySelectorAll('.interest-content');

    if (tabs.length === 0 || contents.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            this.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.style.display = 'block';
                setTimeout(() => targetContent.classList.add('active'), 10);
            }
        });
    });
}

function initGallery() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length === 0 || galleryItems.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active'));
            galleryItems.forEach(item => {
                item.style.display = 'none';
                item.classList.remove('visible');
            });

            this.classList.add('active');

            setTimeout(() => {
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.style.display = 'block';
                        setTimeout(() => item.classList.add('visible'), 50);
                    }
                });
            }, 100);
        });
    });
}

function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
    const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;

    if (!lightbox || !lightboxImg) return;

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 20);
    });
}

function initImageUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const previewGrid = document.getElementById('previewGrid');
    const selectedCount = document.getElementById('selectedCount');
    const cancelUpload = document.getElementById('cancelUpload');
    const confirmUpload = document.getElementById('confirmUpload');
    
    if (!uploadBtn || !imageUpload) {
        console.error('上传按钮或文件输入框未找到!');
        return;
    }
    
    let selectedFiles = [];
    
    uploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });
    
    imageUpload.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    cancelUpload.addEventListener('click', () => {
        uploadArea.style.display = 'none';
        previewGrid.innerHTML = '';
        selectedFiles = [];
        selectedCount.textContent = '0';
        imageUpload.value = '';
    });
    
    confirmUpload.addEventListener('click', () => {
        if (selectedFiles.length > 0) {
            uploadImages(selectedFiles);
        }
    });
    
    function handleFiles(files) {
        selectedFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (selectedFiles.length === 0) {
            alert('请选择图片文件');
            return;
        }
        
        previewGrid.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const preview = createPreviewItem(file, index);
            previewGrid.appendChild(preview);
        });
        
        selectedCount.textContent = selectedFiles.length;
        uploadArea.style.display = 'block';
    }
    
    function createPreviewItem(file, index) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        
        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.title = '移除';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFiles.splice(index, 1);
            handleFiles(selectedFiles);
        });
        
        const info = document.createElement('div');
        info.className = 'preview-info';
        info.innerHTML = `<span>${file.name}</span><span>${(file.size / 1024).toFixed(1)} KB</span>`;
        
        item.appendChild(img);
        item.appendChild(removeBtn);
        item.appendChild(info);
        
        return item;
    }
    
    console.log('图片上传功能初始化完成');
}

function uploadImages(files) {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.style.display = 'none';
    }
    
    showUploadProgress();
    
    const formData = new FormData();
    files.forEach((file, index) => {
        formData.append('images', file);
    });
    formData.append('title', `批量上传 ${files.length} 张图片`);
    formData.append('description', '用户上传的图片');
    formData.append('category', 'uploaded');
    
    const API_URL = 'http://localhost:3001/api/images/upload';
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            const progressPercent = (event.loaded / event.total) * 100;
            updateUploadProgress(progressPercent);
        }
    });
    
    xhr.addEventListener('load', () => {
        const progressOverlay = document.getElementById('upload-progress');
        if (progressOverlay) {
            document.body.removeChild(progressOverlay);
        }
        
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                showSuccessMessage();
                
                if (response.image || (response.images && response.images.length > 0)) {
                    const images = response.image ? [response.image] : response.images;
                    images.forEach(imgData => {
                        addImageToGalleryFromAPI(imgData);
                    });
                }
            } catch (error) {
                console.error('解析响应失败:', error);
                alert('上传成功但显示失败，请刷新页面');
            }
        } else {
            console.error('上传失败:', xhr.status);
            alert(`上传失败: ${xhr.status}`);
        }
    });
    
    xhr.addEventListener('error', () => {
        const progressOverlay = document.getElementById('upload-progress');
        if (progressOverlay) {
            document.body.removeChild(progressOverlay);
        }
        
        console.log('后端未运行，使用本地存储模式');
        useLocalStorageFallback(files);
    });
    
    xhr.addEventListener('timeout', () => {
        const progressOverlay = document.getElementById('upload-progress');
        if (progressOverlay) {
            document.body.removeChild(progressOverlay);
        }
        alert('上传超时，使用本地存储模式');
        useLocalStorageFallback(files);
    });
    
    xhr.open('POST', API_URL, true);
    xhr.timeout = 120000;
    xhr.send(formData);
}

function useLocalStorageFallback(files) {
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages')) || [];
    let processedCount = 0;
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type,
                size: file.size,
                src: e.target.result,
                category: 'uploaded',
                uploadedAt: new Date().toISOString()
            };
            
            uploadedImages.push(imageData);
            localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
            
            processedCount++;
            if (processedCount === files.length) {
                showSuccessMessage();
                uploadedImages.forEach(img => {
                    addImageToGallery(img);
                });
            }
        };
        reader.readAsDataURL(file);
    });
}

function addImageToGallery(imageData) {
    console.log('Adding image to gallery:', imageData.name);
    
    const galleryContainer = document.querySelector('.gallery-grid');
    if (!galleryContainer) {
        console.error('Gallery container not found');
        return;
    }
    
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item visible';
    galleryItem.dataset.category = 'uploaded';
    
    const img = document.createElement('img');
    img.src = imageData.src;
    img.alt = imageData.name;
    
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    
    const title = document.createElement('h4');
    title.textContent = imageData.name;
    
    const description = document.createElement('p');
    description.textContent = '用户上传的图片';
    
    overlay.appendChild(title);
    overlay.appendChild(description);
    
    galleryItem.appendChild(img);
    galleryItem.appendChild(overlay);
    galleryContainer.prepend(galleryItem);
    
    console.log('Image added to gallery successfully');
    
    galleryItem.addEventListener('click', () => {
        const lightbox = document.querySelector('.lightbox');
        const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
        
        if (lightbox && lightboxImg) {
            lightboxImg.src = imageData.src;
            lightboxImg.alt = imageData.name;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
}

function addImageToGalleryFromAPI(imageData) {
    console.log('Adding image from API to gallery:', imageData);
    
    const galleryGrid = document.querySelector('.gallery-grid');
    
    if (galleryGrid) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.category = imageData.category || 'uploaded';
        
        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = imageData.title || '用户上传的图片';
        
        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        
        const title = document.createElement('h4');
        title.textContent = imageData.title || '新上传';
        
        const description = document.createElement('p');
        description.textContent = imageData.description || '用户上传的图片';
        
        const icon = document.createElement('span');
        icon.textContent = '📷';
        
        overlay.appendChild(title);
        overlay.appendChild(description);
        overlay.appendChild(icon);
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(overlay);
        
        galleryItem.addEventListener('click', function() {
            const lightbox = document.querySelector('.lightbox');
            const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
            
            if (lightbox && lightboxImg) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
        
        galleryGrid.insertBefore(galleryItem, galleryGrid.firstChild);
        
        galleryItem.style.opacity = '0';
        galleryItem.style.transform = 'translateY(30px)';
        galleryItem.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            galleryItem.style.opacity = '1';
            galleryItem.style.transform = 'translateY(0)';
        }, 50);
        
        initGallery();
        console.log('Image added to gallery successfully from API');
    } else {
        console.error('Gallery grid not found');
    }
}

function showSuccessMessage() {
    const successOverlay = document.createElement('div');
    successOverlay.id = 'upload-success';
    successOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    const successContent = document.createElement('div');
    successContent.style.cssText = `
        background: var(--bg-card);
        padding: 40px;
        border-radius: 15px;
        width: 90%;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(201, 169, 98, 0.2);
    `;
    
    const icon = document.createElement('div');
    icon.style.cssText = `
        font-size: 64px;
        margin-bottom: 20px;
    `;
    icon.textContent = '✅';
    
    const title = document.createElement('h3');
    title.textContent = '上传成功!';
    title.style.cssText = `
        color: var(--text-primary);
        margin-top: 0;
        margin-bottom: 15px;
        text-align: center;
        font-size: 1.5rem;
    `;
    
    const message = document.createElement('p');
    message.textContent = '您的图片已成功上传并添加到摄影作品板块';
    message.style.cssText = `
        color: var(--text-secondary);
        margin-bottom: 25px;
    `;
    
    const button = document.createElement('button');
    button.textContent = '确定';
    button.style.cssText = `
        padding: 12px 40px;
        background: var(--accent-gradient);
        border: none;
        border-radius: 50px;
        color: var(--bg-primary);
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', () => {
        document.body.removeChild(successOverlay);
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 5px 15px rgba(201, 169, 98, 0.3)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
    });
    
    successContent.appendChild(icon);
    successContent.appendChild(title);
    successContent.appendChild(message);
    successContent.appendChild(button);
    
    successOverlay.appendChild(successContent);
    document.body.appendChild(successOverlay);
    
    setTimeout(() => {
        if (document.body.contains(successOverlay)) {
            document.body.removeChild(successOverlay);
        }
    }, 3000);
}

function updateUploadProgress(progress) {
    const progressBar = document.querySelector('#upload-progress .progress-bar');
    const percentageText = document.querySelector('#upload-progress .percentage-text');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (percentageText) {
        percentageText.textContent = `${Math.round(progress)}%`;
    }
}

function showUploadProgress() {
    const progressOverlay = document.createElement('div');
    progressOverlay.id = 'upload-progress';
    progressOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    const progressContent = document.createElement('div');
    progressContent.style.cssText = `
        background: var(--bg-card);
        padding: 30px;
        border-radius: 15px;
        width: 90%;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(201, 169, 98, 0.2);
    `;
    
    const title = document.createElement('h3');
    title.textContent = '上传中...';
    title.style.cssText = `
        color: var(--text-primary);
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
    `;
    
    const progressBarContainer = document.createElement('div');
    progressBarContainer.style.cssText = `
        width: 100%;
        height: 8px;
        background: var(--bg-secondary);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 10px;
    `;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.cssText = `
        height: 100%;
        width: 0%;
        background: var(--accent-gradient);
        transition: width 0.3s ease;
    `;
    
    progressBarContainer.appendChild(progressBar);
    
    const percentageText = document.createElement('div');
    percentageText.className = 'percentage-text';
    percentageText.textContent = '0%';
    percentageText.style.cssText = `
        color: var(--text-muted);
        font-size: 0.9rem;
    `;
    
    progressContent.appendChild(title);
    progressContent.appendChild(progressBarContainer);
    progressContent.appendChild(percentageText);
    
    progressOverlay.appendChild(progressContent);
    document.body.appendChild(progressOverlay);
}

function loadUploadedImages() {
    console.log('Loading uploaded images...');
    
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages')) || [];
    
    if (uploadedImages.length > 0) {
        console.log('Found', uploadedImages.length, 'images in localStorage');
        uploadedImages.forEach((imageData, index) => {
            console.log('Loading image', index + 1, ':', imageData.name);
            addImageToGallery(imageData);
        });
    }
    
    const API_URL = 'http://localhost:3001/api/images';
    
    const xhr = new XMLHttpRequest();
    
    xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                console.log('API images loaded:', response.images.length);
                
                if (response.images && response.images.length > 0) {
                    localStorage.removeItem('uploadedImages');
                    
                    response.images.forEach(image => {
                        console.log('Loading API image:', image.title);
                        addImageToGalleryFromAPI(image);
                    });
                }
            } catch (error) {
                console.error('Error parsing API response:', error);
            }
        } else {
            console.error('Failed to load images from API:', xhr.status);
        }
    });
    
    xhr.addEventListener('error', () => {
        console.error('Network error while loading images');
    });
    
    xhr.open('GET', API_URL, true);
    xhr.send();
}