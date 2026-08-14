/**
 * Remove Background AI - Main Application
 * 100% client-side background removal using @imgly/background-removal
 */
import { removeBackground } from '@imgly/background-removal';

// ============================================================
// APP STATE
// ============================================================
const state = {
  originalFile: null,
  originalUrl: null,
  resultUrl: null,
  isProcessing: false,
};

// ============================================================
// DOM RENDERING
// ============================================================
function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Header -->
    <header class="header" id="header">
      <a href="/" class="header__logo">
        <div class="header__logo-icon">✂️</div>
        <div class="header__logo-text"><span>RemoveBG</span> AI</div>
      </a>
      <div class="header__badge">🔒 100% Private · Runs in Browser</div>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="hero-section">
      <h1 class="hero__title animate-fade-in">
        Xóa Nền Ảnh Bằng <br />
        <span class="hero__title-gradient">Trí Tuệ Nhân Tạo</span>
      </h1>
      <p class="hero__subtitle animate-fade-in" style="animation-delay: 0.1s">
        Miễn phí · Không cần đăng ký · Ảnh được xử lý ngay trên thiết bị của bạn, không gửi đi đâu cả.
      </p>
      <div class="features animate-fade-in" style="animation-delay: 0.2s">
        <div class="feature-tag">
          <span class="feature-tag__icon">🤖</span>
          AI Powered
        </div>
        <div class="feature-tag">
          <span class="feature-tag__icon">⚡</span>
          Xử lý nhanh
        </div>
        <div class="feature-tag">
          <span class="feature-tag__icon">🔒</span>
          Bảo mật tuyệt đối
        </div>
        <div class="feature-tag">
          <span class="feature-tag__icon">💰</span>
          Miễn phí 100%
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-container">
      <!-- Upload Zone -->
      <div class="upload-zone glass-card animate-fade-in-up" id="upload-zone" style="animation-delay: 0.3s">
        <div class="upload-zone__icon">📁</div>
        <p class="upload-zone__title">Kéo thả ảnh vào đây</p>
        <p class="upload-zone__subtitle">
          hoặc <span class="upload-zone__browse">click để chọn file</span>
        </p>
        <p class="upload-zone__formats">Hỗ trợ: JPG, PNG, WEBP · Tối đa 10MB</p>
        <input type="file" id="file-input" class="sr-only" accept="image/jpeg,image/png,image/webp" />
      </div>

      <!-- Processing Section -->
      <div class="processing-section" id="processing-section">
        <!-- Progress Bar -->
        <div class="progress-container glass-card" id="progress-container">
          <div class="progress-bar-wrapper">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
          <div class="progress-info">
            <span class="progress-text" id="progress-text">Đang chuẩn bị...</span>
            <span class="progress-percentage" id="progress-percentage">0%</span>
          </div>
        </div>

        <!-- Preview Area -->
        <div class="preview-area" id="preview-area">
          <!-- Original Image -->
          <div class="preview-card glass-card">
            <div class="preview-card__header">
              <span class="preview-card__label">
                <span class="preview-card__label-dot preview-card__label-dot--original"></span>
                Ảnh gốc
              </span>
              <span class="file-info" id="file-info"></span>
            </div>
            <div class="preview-card__image-container" id="original-container">
              <img class="preview-card__image" id="original-image" alt="Ảnh gốc" />
            </div>
          </div>

          <!-- Result Image -->
          <div class="preview-card glass-card">
            <div class="preview-card__header">
              <span class="preview-card__label">
                <span class="preview-card__label-dot preview-card__label-dot--result"></span>
                Kết quả
              </span>
            </div>
            <div class="preview-card__image-container preview-card__image-container--result" id="result-container">
              <div class="spinner-overlay" id="spinner-overlay">
                <div class="spinner"></div>
                <span class="spinner-text">AI đang xử lý...</span>
              </div>
              <img class="preview-card__image" id="result-image" alt="Ảnh đã xóa nền" style="display:none" />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-bar" id="action-bar">
          <button class="btn btn--primary btn--lg" id="btn-download" disabled>
            📥 Tải xuống PNG
          </button>
          <button class="btn btn--secondary btn--lg" id="btn-new">
            🔄 Ảnh mới
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>Powered by <a href="https://img.ly" target="_blank" rel="noopener">IMG.LY</a> · 
         AI chạy 100% trên trình duyệt · Không lưu trữ ảnh</p>
      <p style="margin-top: 0.5rem; opacity: 0.6;">© 2026 RemoveBG AI</p>
    </footer>

    <!-- Toast Notification -->
    <div class="toast" id="toast"></div>
  `;
}

// ============================================================
// EVENT HANDLERS
// ============================================================
function initEventListeners() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');

  // Click to upload
  uploadZone.addEventListener('click', () => fileInput.click());

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Download button
  document.getElementById('btn-download').addEventListener('click', handleDownload);

  // New image button
  document.getElementById('btn-new').addEventListener('click', handleReset);
}

// ============================================================
// FILE HANDLING
// ============================================================
function handleFile(file) {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('Vui lòng chọn file ảnh (JPG, PNG, WEBP)', 'error');
    return;
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('File quá lớn. Tối đa 10MB', 'error');
    return;
  }

  // Store file and create preview URL
  state.originalFile = file;
  if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
  if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);
  state.originalUrl = URL.createObjectURL(file);
  state.resultUrl = null;

  // Update UI
  showProcessingSection();
  displayOriginalImage(file);
  processImage(file);
}

function displayOriginalImage(file) {
  const img = document.getElementById('original-image');
  img.src = state.originalUrl;

  // File info
  const sizeKB = (file.size / 1024).toFixed(1);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const sizeText = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
  document.getElementById('file-info').textContent = `${file.name} · ${sizeText}`;
}

function showProcessingSection() {
  document.getElementById('upload-zone').style.display = 'none';
  const section = document.getElementById('processing-section');
  section.classList.add('active');

  // Reset result
  document.getElementById('result-image').style.display = 'none';
  document.getElementById('spinner-overlay').style.display = 'flex';
  document.getElementById('btn-download').disabled = true;

  // Show progress
  const progressContainer = document.getElementById('progress-container');
  progressContainer.classList.add('active');
  updateProgress(0, 'Đang chuẩn bị model AI...');
}

// ============================================================
// BACKGROUND REMOVAL PROCESSING
// ============================================================
async function processImage(file) {
  if (state.isProcessing) return;
  state.isProcessing = true;

  try {
    const imageUrl = state.originalUrl;

    showToast('Đang khởi tạo AI... (lần đầu có thể mất 10-30 giây)', 'info');

    // Call @imgly/background-removal
    const blob = await removeBackground(imageUrl, {
      progress: (key, current, total) => {
        // Model download progress
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;

        if (key.includes('fetch')) {
          updateProgress(percent * 0.7, `Đang tải model AI... ${formatBytes(current)} / ${formatBytes(total)}`);
        } else if (key.includes('compute')) {
          updateProgress(70 + percent * 0.3, 'AI đang phân tích ảnh...');
        } else {
          updateProgress(percent * 0.5, `Đang xử lý: ${key}`);
        }
      },
    });

    // Processing complete
    updateProgress(100, 'Hoàn tất!');

    // Create result URL
    state.resultUrl = URL.createObjectURL(blob);

    // Display result
    const resultImg = document.getElementById('result-image');
    resultImg.src = state.resultUrl;
    resultImg.style.display = 'block';
    document.getElementById('spinner-overlay').style.display = 'none';

    // Enable download
    document.getElementById('btn-download').disabled = false;

    // Hide progress after a moment
    setTimeout(() => {
      document.getElementById('progress-container').classList.remove('active');
    }, 1000);

    showToast('✅ Xóa nền thành công!', 'success');
  } catch (error) {
    console.error('Background removal error:', error);
    document.getElementById('spinner-overlay').innerHTML = `
      <span style="font-size: 2rem;">❌</span>
      <span class="spinner-text" style="color: var(--color-accent-error);">
        Lỗi xử lý. Vui lòng thử lại.
      </span>
    `;
    showToast(`Lỗi: ${error.message}`, 'error');
    updateProgress(0, 'Xử lý thất bại');
  } finally {
    state.isProcessing = false;
  }
}

// ============================================================
// DOWNLOAD
// ============================================================
function handleDownload() {
  if (!state.resultUrl) return;

  const link = document.createElement('a');
  link.href = state.resultUrl;

  // Generate filename
  const originalName = state.originalFile
    ? state.originalFile.name.replace(/\.[^/.]+$/, '')
    : 'image';
  link.download = `${originalName}_no-bg.png`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('📥 Đang tải xuống...', 'success');
}

// ============================================================
// RESET
// ============================================================
function handleReset() {
  // Clean up URLs
  if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
  if (state.resultUrl) URL.revokeObjectURL(state.resultUrl);

  // Reset state
  state.originalFile = null;
  state.originalUrl = null;
  state.resultUrl = null;
  state.isProcessing = false;

  // Reset UI
  document.getElementById('upload-zone').style.display = '';
  document.getElementById('processing-section').classList.remove('active');
  document.getElementById('file-input').value = '';
  document.getElementById('progress-container').classList.remove('active');
  updateProgress(0, 'Đang chuẩn bị...');
}

// ============================================================
// UTILITIES
// ============================================================
function updateProgress(percent, text) {
  const bar = document.getElementById('progress-bar');
  const textEl = document.getElementById('progress-text');
  const percentEl = document.getElementById('progress-percentage');

  if (bar) bar.style.width = `${Math.min(percent, 100)}%`;
  if (textEl) textEl.textContent = text;
  if (percentEl) percentEl.textContent = `${Math.round(percent)}%`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.className = `toast toast--${type} show`;
  toast.textContent = message;

  // Auto-hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ============================================================
// INITIALIZE APP
// ============================================================
renderApp();
initEventListeners();
