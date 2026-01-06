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
    
    console.log('Initializing image upload...');
    console.log('Upload button found:', !!uploadBtn);
    console.log('Image upload input found:', !!imageUpload);
    
    if (!uploadBtn || !imageUpload) {
        console.error('Upload button or image upload input not found!');
        return;
    }
    
    // Add click event to upload button
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Upload button clicked');
        imageUpload.click();
    });
    
    // Add change event to file input
    imageUpload.addEventListener('change', (e) => {
        console.log('File input changed');
        handleImageSelect(e);
    });
    
    console.log('Image upload initialization complete');
}

function handleImageSelect(e) {
    console.log('Handling image select...');
    const file = e.target.files[0];
    
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.log('Invalid file type');
        alert('请选择图片文件');
        return;
    }
    
    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        console.log('File too large');
        alert('图片大小不能超过5MB');
        return;
    }
    
    console.log('Creating confirmation dialog...');
    
    // Create confirmation dialog
    try {
        const confirmDialog = createConfirmDialog(file);
        if (confirmDialog) {
            document.body.appendChild(confirmDialog);
            console.log('Confirmation dialog created and added to DOM');
        } else {
            console.error('Failed to create confirmation dialog');
        }
    } catch (error) {
        console.error('Error creating confirmation dialog:', error);
        alert('创建确认对话框失败: ' + error.message);
    }
}

function createConfirmDialog(file) {
    console.log('Creating confirmation dialog for file:', file.name);
    
    try {
        // Create dialog container
        const dialog = document.createElement('div');
        dialog.className = 'upload-confirm-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        // Create dialog content
        const content = document.createElement('div');
        content.className = 'dialog-content';
        content.style.cssText = `
            background: var(--bg-card);
            padding: 30px;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(201, 169, 98, 0.2);
        `;
        
        // Add title
        const title = document.createElement('h3');
        title.textContent = '确认上传图片';
        title.style.cssText = `
            color: var(--text-primary);
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.5rem;
        `;
        
        // Add image preview
        const imgPreview = document.createElement('div');
        imgPreview.className = 'img-preview';
        imgPreview.style.cssText = `
            width: 100%;
            max-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            border-radius: 10px;
            overflow: hidden;
            background: var(--bg-secondary);
        `;
        
        const img = document.createElement('img');
        img.style.cssText = `
            max-width: 100%;
            max-height: 300px;
            object-fit: contain;
        `;
        
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            img.src = e.target.result;
        };
        fileReader.readAsDataURL(file);
        
        imgPreview.appendChild(img);
        
        // Add file info
        const fileInfo = document.createElement('div');
        fileInfo.style.cssText = `
            background: var(--bg-secondary);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            color: var(--text-muted);
        `;
        
        fileInfo.innerHTML = `
            <p style="margin: 5px 0;"><strong>文件名:</strong> ${file.name}</p>
            <p style="margin: 5px 0;"><strong>文件大小:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
            <p style="margin: 5px 0;"><strong>文件类型:</strong> ${file.type}</p>
        `;
        
        // Add buttons
        const buttons = document.createElement('div');
        buttons.style.cssText = `
            display: flex;
            justify-content: space-between;
            gap: 15px;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 12px 25px;
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 50px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            flex: 1;
        `;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '确认上传';
        confirmBtn.style.cssText = `
            padding: 12px 25px;
            background: var(--accent-gradient);
            border: none;
            border-radius: 50px;
            color: var(--bg-primary);
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            flex: 1;
        `;
        
        // Add event listeners
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        confirmBtn.addEventListener('click', () => {
            // Close dialog
            document.body.removeChild(dialog);
            
            // Upload image
            uploadImage(file);
        });
        
        // Add hover effects
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = 'rgba(201, 169, 98, 0.1)';
            cancelBtn.style.borderColor = 'rgba(201, 169, 98, 0.3)';
        });
        
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'transparent';
            cancelBtn.style.borderColor = 'var(--border-color)';
        });
        
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.transform = 'translateY(-2px)';
            confirmBtn.style.boxShadow = '0 5px 15px rgba(201, 169, 98, 0.3)';
        });
        
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = 'none';
        });
        
        // Append all elements
        buttons.appendChild(cancelBtn);
        buttons.appendChild(confirmBtn);
        
        content.appendChild(title);
        content.appendChild(imgPreview);
        content.appendChild(fileInfo);
        content.appendChild(buttons);
        
        dialog.appendChild(content);
        
        // Close dialog when clicking outside
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });
        
        console.log('Dialog created successfully');
        return dialog;
    } catch (error) {
        console.error('Error creating confirmation dialog:', error);
        return null;
    }
}

function uploadImage(file) {
    console.log('Starting upload process for file:', file.name);
    
    // Show upload progress
    showUploadProgress();
    
    // Create a unique ID for this image
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `uploaded_${timestamp}.${fileExtension}`;
    
    // Create a reader to convert the file to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('File read completed, processing image data...');
        
        // Store the image data in localStorage
        const imageData = {
            src: e.target.result,
            name: file.name,
            type: file.type,
            size: file.size,
            timestamp: timestamp,
            fileName: fileName
        };
        
        // Get existing uploaded images or create empty array
        let uploadedImages = JSON.parse(localStorage.getItem('uploadedImages')) || [];
        
        // Add new image to the array
        uploadedImages.push(imageData);
        
        // Save back to localStorage
        localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
        console.log('Image saved to localStorage with timestamp:', timestamp);
        
        // Simulate a small delay to show the progress
        setTimeout(() => {
            // Close the progress overlay
            const progressOverlay = document.getElementById('upload-progress');
            if (progressOverlay) {
                document.body.removeChild(progressOverlay);
            }
            
            // Display success message
            showSuccessMessage();
            
            // Add the new image to the gallery
            addImageToGallery(imageData);
        }, 1500);
    };
    
    // Handle read error
    reader.onerror = function() {
        console.error('Error reading file');
        
        // Close the progress overlay
        const progressOverlay = document.getElementById('upload-progress');
        if (progressOverlay) {
            document.body.removeChild(progressOverlay);
        }
        
        alert('读取文件失败，请重试');
    };
    
    // Start reading the file
    console.log('Starting to read file...');
    reader.readAsDataURL(file);
}

function showUploadProgress() {
    // Create progress overlay
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
    
    // Create progress content
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
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = '上传中...';
    title.style.cssText = `
        color: var(--text-primary);
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
    `;
    
    // Add progress bar
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
    progressBar.style.cssText = `
        height: 100%;
        width: 0%;
        background: var(--accent-gradient);
        transition: width 0.3s ease;
    `;
    
    progressBarContainer.appendChild(progressBar);
    
    // Add percentage text
    const percentageText = document.createElement('div');
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
    
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;
        percentageText.textContent = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            // Close after a brief delay
            setTimeout(() => {
                document.body.removeChild(progressOverlay);
            }, 500);
        }
    }, 150);
}

function showSuccessMessage() {
    // Create success overlay
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
    
    // Create success content
    const successContent = document.createElement('div');
    successContent.style.cssText = `
        background: var(--bg-card);
        padding: 30px;
        border-radius: 15px;
        width: 90%;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(201, 169, 98, 0.2);
        animation: successAnimation 0.5s ease;
    `;
    
    // Add success icon
    const icon = document.createElement('div');
    icon.style.cssText = `
        font-size: 4rem;
        color: var(--accent-color);
        margin-bottom: 15px;
    `;
    icon.textContent = '✅';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = '上传成功！';
    title.style.cssText = `
        color: var(--text-primary);
        margin-top: 0;
        margin-bottom: 10px;
        text-align: center;
    `;
    
    // Add message
    const message = document.createElement('p');
    message.textContent = '图片已成功添加到摄影作品区域';
    message.style.cssText = `
        color: var(--text-muted);
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
    `;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        padding: 12px 25px;
        background: var(--accent-gradient);
        border: none;
        border-radius: 50px;
        color: var(--bg-primary);
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        width: 100%;
    `;
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(successOverlay);
    });
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.transform = 'translateY(-2px)';
        closeBtn.style.boxShadow = '0 5px 15px rgba(201, 169, 98, 0.3)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.transform = 'translateY(0)';
        closeBtn.style.boxShadow = 'none';
    });
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes successAnimation {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Append all elements
    successContent.appendChild(icon);
    successContent.appendChild(title);
    successContent.appendChild(message);
    successContent.appendChild(closeBtn);
    
    successOverlay.appendChild(successContent);
    document.body.appendChild(successOverlay);
    
    // Auto close after 3 seconds
    setTimeout(() => {
        if (document.body.contains(successOverlay)) {
            document.body.removeChild(successOverlay);
        }
    }, 3000);
}

function addImageToGallery(imageData) {
    console.log('Adding image to gallery:', imageData.name);
    
    // Create new gallery item
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.dataset.category = 'uploaded';
    galleryItem.style.cssText = `
        opacity: 0;
        transform: scale(0.8);
    `;
    
    // Create image element
    const img = document.createElement('img');
    img.src = imageData.src;
    img.alt = imageData.name;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    
    const title = document.createElement('h4');
    title.textContent = '我的摄影作品';
    
    const description = document.createElement('p');
    description.textContent = '刚上传的照片';
    
    const emoji = document.createElement('span');
    emoji.textContent = '📷';
    
    overlay.appendChild(title);
    overlay.appendChild(description);
    overlay.appendChild(emoji);
    
    galleryItem.appendChild(img);
    galleryItem.appendChild(overlay);
    
    // Get gallery grid
    const galleryGrid = document.querySelector('.gallery-grid');
    
    if (galleryGrid) {
        // Add to gallery
        galleryGrid.appendChild(galleryItem);
        
        // Animate in
        setTimeout(() => {
            galleryItem.style.opacity = '1';
            galleryItem.style.transform = 'scale(1)';
            galleryItem.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 10);
        
        // Add lightbox functionality to the new image
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
        
        // Re-initialize gallery filtering to include the new item
        initGallery();
        console.log('Image added to gallery successfully');
    } else {
        console.error('Gallery grid not found');
    }
}

function loadUploadedImages() {
    console.log('Loading uploaded images from localStorage...');
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages')) || [];
    
    console.log('Found', uploadedImages.length, 'uploaded images');
    
    uploadedImages.forEach((imageData, index) => {
        console.log('Loading image', index + 1, ':', imageData.name);
        addImageToGallery(imageData);
    });
}