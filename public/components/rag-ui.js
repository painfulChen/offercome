/**
 * RAG UI 通用组件库
 * 提供可复用的UI组件，支持TOC、文档管理、搜索等功能
 */

class RAGUI {
    constructor(config = {}) {
        this.config = {
            apiBase: config.apiBase || '/api/rag',
            token: config.token || '',
            theme: config.theme || 'default',
            ...config
        };
        
        this.components = {};
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
    }

    // 加载主题样式
    loadTheme() {
        const themes = {
            default: this.getDefaultTheme(),
            dark: this.getDarkTheme(),
            luxury: this.getLuxuryTheme()
        };
        
        const theme = themes[this.config.theme] || themes.default;
        this.injectStyles(theme);
    }

    // 注入样式
    injectStyles(css) {
        if (!document.getElementById('rag-ui-styles')) {
            const style = document.createElement('style');
            style.id = 'rag-ui-styles';
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    // 默认主题
    getDefaultTheme() {
        return `
            .rag-ui {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #333;
            }
            
            .rag-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .rag-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                margin-bottom: 20px;
            }
            
            .rag-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            }
            
            .rag-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1em;
                font-weight: 500;
                transition: all 0.3s ease;
                margin: 5px;
            }
            
            .rag-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .rag-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            
            .rag-tabs {
                display: flex;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 10px;
                padding: 5px;
                margin-bottom: 20px;
                overflow-x: auto;
            }
            
            .rag-tab {
                flex: 1;
                padding: 12px 20px;
                background: transparent;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
                font-weight: 500;
            }
            
            .rag-tab.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .rag-tab-content {
                display: none;
            }
            
            .rag-tab-content.active {
                display: block;
            }
            
            .rag-upload-area {
                border: 2px dashed #3498db;
                border-radius: 10px;
                padding: 40px;
                text-align: center;
                background: rgba(52, 152, 219, 0.05);
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .rag-upload-area:hover {
                border-color: #2980b9;
                background: rgba(52, 152, 219, 0.1);
            }
            
            .rag-upload-area.dragover {
                border-color: #27ae60;
                background: rgba(39, 174, 96, 0.1);
            }
            
            .rag-form-group {
                margin-bottom: 20px;
            }
            
            .rag-form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #2c3e50;
            }
            
            .rag-form-control {
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 1em;
                transition: border-color 0.3s ease;
            }
            
            .rag-form-control:focus {
                outline: none;
                border-color: #3498db;
            }
            
            .rag-toc {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 300px;
                max-height: 80vh;
                overflow-y: auto;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                z-index: 1000;
            }
            
            .rag-toc-title {
                font-size: 1.2em;
                font-weight: bold;
                margin-bottom: 15px;
                color: #2c3e50;
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }
            
            .rag-toc-list {
                list-style: none;
                padding: 0;
            }
            
            .rag-toc-item {
                margin-bottom: 8px;
            }
            
            .rag-toc-link {
                display: block;
                padding: 8px 12px;
                color: #7f8c8d;
                text-decoration: none;
                border-radius: 6px;
                transition: all 0.3s ease;
                font-size: 0.9em;
            }
            
            .rag-toc-link:hover {
                background: rgba(52, 152, 219, 0.1);
                color: #3498db;
            }
            
            .rag-toc-link.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .rag-progress {
                width: 100%;
                height: 8px;
                background: #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
                margin: 10px 0;
            }
            
            .rag-progress-bar {
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                transition: width 0.3s ease;
            }
            
            .rag-loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: rag-spin 1s linear infinite;
            }
            
            @keyframes rag-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .rag-alert {
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
            }
            
            .rag-alert-success {
                background: rgba(39, 174, 96, 0.1);
                border: 1px solid #27ae60;
                color: #27ae60;
            }
            
            .rag-alert-error {
                background: rgba(231, 76, 60, 0.1);
                border: 1px solid #e74c3c;
                color: #e74c3c;
            }
            
            .rag-alert-warning {
                background: rgba(243, 156, 18, 0.1);
                border: 1px solid #f39c12;
                color: #f39c12;
            }
        `;
    }

    // 暗色主题
    getDarkTheme() {
        return `
            .rag-ui {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #ecf0f1;
                background: #2c3e50;
            }
            
            .rag-card {
                background: rgba(44, 62, 80, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                margin-bottom: 20px;
                border: 1px solid #34495e;
            }
            
            .rag-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }
            
            .rag-btn-primary {
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
            }
            
            .rag-tabs {
                background: rgba(44, 62, 80, 0.9);
                border: 1px solid #34495e;
            }
            
            .rag-tab.active {
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
            }
            
            .rag-toc {
                background: rgba(44, 62, 80, 0.95);
                border: 1px solid #34495e;
            }
            
            .rag-form-control {
                background: #34495e;
                border: 2px solid #2c3e50;
                color: #ecf0f1;
            }
            
            .rag-form-control:focus {
                border-color: #3498db;
            }
        `;
    }

    // 豪华主题
    getLuxuryTheme() {
        return `
            .rag-ui {
                font-family: 'Playfair Display', serif;
                color: #2c3e50;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            
            .rag-card {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .rag-btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            .rag-toc {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
        `;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 全局错误处理
        window.addEventListener('error', (e) => {
            console.error('RAG UI Error:', e.error);
        });
    }

    // 创建TOC组件
    createTOC(container, sections = []) {
        const tocId = 'rag-toc-' + Date.now();
        const toc = document.createElement('div');
        toc.id = tocId;
        toc.className = 'rag-toc';
        
        const title = document.createElement('div');
        title.className = 'rag-toc-title';
        title.textContent = '目录';
        
        const list = document.createElement('ul');
        list.className = 'rag-toc-list';
        
        sections.forEach((section, index) => {
            const item = document.createElement('li');
            item.className = 'rag-toc-item';
            
            const link = document.createElement('a');
            link.className = 'rag-toc-link';
            link.href = `#${section.id}`;
            link.textContent = section.title;
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection(section.id);
                this.updateTOCActive(link);
            });
            
            item.appendChild(link);
            list.appendChild(item);
        });
        
        toc.appendChild(title);
        toc.appendChild(list);
        document.body.appendChild(toc);
        
        // 监听滚动更新TOC
        window.addEventListener('scroll', () => {
            this.updateTOCOnScroll(tocId);
        });
        
        return tocId;
    }

    // 滚动到指定区域
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    // 更新TOC活动状态
    updateTOCActive(activeLink) {
        const links = document.querySelectorAll('.rag-toc-link');
        links.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    // 滚动时更新TOC
    updateTOCOnScroll(tocId) {
        const toc = document.getElementById(tocId);
        if (!toc) return;
        
        const sections = document.querySelectorAll('[id^="section-"]');
        let activeSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                activeSection = section.id;
            }
        });
        
        if (activeSection) {
            const link = toc.querySelector(`[href="#${activeSection}"]`);
            if (link) {
                this.updateTOCActive(link);
            }
        }
    }

    // 创建上传组件
    createUploader(container, options = {}) {
        const uploaderId = 'rag-uploader-' + Date.now();
        const uploader = document.createElement('div');
        uploader.id = uploaderId;
        uploader.className = 'rag-card';
        
        uploader.innerHTML = `
            <h3>文档上传</h3>
            <div class="rag-upload-area" id="${uploaderId}-area">
                <div class="rag-upload-content">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 3em; color: #3498db; margin-bottom: 15px;"></i>
                    <p>拖拽文件到此处或点击选择文件</p>
                    <p style="font-size: 0.9em; color: #7f8c8d; margin-top: 10px;">
                        支持 PDF, DOC, DOCX, TXT, MD, 图片等格式
                    </p>
                </div>
                <input type="file" id="${uploaderId}-input" style="display: none;" multiple>
            </div>
            
            <div class="rag-form-group">
                <label for="${uploaderId}-category">分类:</label>
                <input type="text" id="${uploaderId}-category" class="rag-form-control" placeholder="输入文档分类">
            </div>
            
            <div class="rag-form-group">
                <label for="${uploaderId}-tags">标签:</label>
                <input type="text" id="${uploaderId}-tags" class="rag-form-control" placeholder="输入标签，用逗号分隔">
            </div>
            
            <div class="rag-progress" id="${uploaderId}-progress" style="display: none;">
                <div class="rag-progress-bar" id="${uploaderId}-progress-bar" style="width: 0%"></div>
            </div>
            
            <div id="${uploaderId}-status"></div>
            
            <button class="rag-btn rag-btn-primary" id="${uploaderId}-upload-btn">
                开始上传
            </button>
        `;
        
        container.appendChild(uploader);
        this.setupUploaderEvents(uploaderId, options);
        
        return uploaderId;
    }

    // 设置上传器事件
    setupUploaderEvents(uploaderId, options) {
        const area = document.getElementById(`${uploaderId}-area`);
        const input = document.getElementById(`${uploaderId}-input`);
        const uploadBtn = document.getElementById(`${uploaderId}-upload-btn`);
        const progress = document.getElementById(`${uploaderId}-progress`);
        const progressBar = document.getElementById(`${uploaderId}-progress-bar`);
        const status = document.getElementById(`${uploaderId}-status`);
        
        // 拖拽上传
        area.addEventListener('click', () => input.click());
        
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            input.files = e.dataTransfer.files;
            this.handleFileSelection(uploaderId, options);
        });
        
        // 文件选择
        input.addEventListener('change', () => {
            this.handleFileSelection(uploaderId, options);
        });
        
        // 上传按钮
        uploadBtn.addEventListener('click', () => {
            this.uploadFiles(uploaderId, options);
        });
    }

    // 处理文件选择
    handleFileSelection(uploaderId, options) {
        const input = document.getElementById(`${uploaderId}-input`);
        const status = document.getElementById(`${uploaderId}-status`);
        
        if (input.files.length > 0) {
            const fileList = Array.from(input.files).map(file => file.name).join(', ');
            status.innerHTML = `
                <div class="rag-alert rag-alert-success">
                    已选择 ${input.files.length} 个文件: ${fileList}
                </div>
            `;
        }
    }

    // 上传文件
    async uploadFiles(uploaderId, options) {
        const input = document.getElementById(`${uploaderId}-input`);
        const progress = document.getElementById(`${uploaderId}-progress`);
        const progressBar = document.getElementById(`${uploaderId}-progress-bar`);
        const status = document.getElementById(`${uploaderId}-status`);
        const uploadBtn = document.getElementById(`${uploaderId}-upload-btn`);
        
        if (input.files.length === 0) {
            status.innerHTML = `
                <div class="rag-alert rag-alert-warning">
                    请先选择文件
                </div>
            `;
            return;
        }
        
        progress.style.display = 'block';
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<span class="rag-loading"></span> 上传中...';
        
        const formData = new FormData();
        for (let file of input.files) {
            formData.append('file', file);
        }
        
        const category = document.getElementById(`${uploaderId}-category`).value;
        const tags = document.getElementById(`${uploaderId}-tags`).value;
        
        if (category) formData.append('category', category);
        if (tags) formData.append('tags', tags);
        
        try {
            const response = await fetch(`${this.config.apiBase}/upload/local`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.token}`
                },
                body: formData
            });
            
            const result = await response.json();
            
            if (result.status === 'ok') {
                status.innerHTML = `
                    <div class="rag-alert rag-alert-success">
                        上传成功！文档ID: ${result.document.documentId}
                    </div>
                `;
                
                // 触发上传成功回调
                if (options.onSuccess) {
                    options.onSuccess(result);
                }
            } else {
                throw new Error(result.message || '上传失败');
            }
        } catch (error) {
            status.innerHTML = `
                <div class="rag-alert rag-alert-error">
                    上传失败: ${error.message}
                </div>
            `;
        } finally {
            progress.style.display = 'none';
            uploadBtn.disabled = false;
            uploadBtn.textContent = '开始上传';
            input.value = '';
        }
    }

    // 创建搜索组件
    createSearch(container, options = {}) {
        const searchId = 'rag-search-' + Date.now();
        const search = document.createElement('div');
        search.id = searchId;
        search.className = 'rag-card';
        
        search.innerHTML = `
            <h3>智能搜索</h3>
            <div class="rag-form-group">
                <label for="${searchId}-query">搜索查询:</label>
                <input type="text" id="${searchId}-query" class="rag-form-control" placeholder="输入您的问题或关键词">
            </div>
            
            <div class="rag-form-group">
                <label for="${searchId}-limit">结果数量:</label>
                <select id="${searchId}-limit" class="rag-form-control">
                    <option value="5">5个结果</option>
                    <option value="10">10个结果</option>
                    <option value="20">20个结果</option>
                </select>
            </div>
            
            <button class="rag-btn rag-btn-primary" id="${searchId}-search-btn">
                搜索
            </button>
            
            <div id="${searchId}-results"></div>
        `;
        
        container.appendChild(search);
        this.setupSearchEvents(searchId, options);
        
        return searchId;
    }

    // 设置搜索事件
    setupSearchEvents(searchId, options) {
        const queryInput = document.getElementById(`${searchId}-query`);
        const searchBtn = document.getElementById(`${searchId}-search-btn`);
        const results = document.getElementById(`${searchId}-results`);
        
        searchBtn.addEventListener('click', () => {
            this.performSearch(searchId, options);
        });
        
        queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchId, options);
            }
        });
    }

    // 执行搜索
    async performSearch(searchId, options) {
        const queryInput = document.getElementById(`${searchId}-query`);
        const limitSelect = document.getElementById(`${searchId}-limit`);
        const searchBtn = document.getElementById(`${searchId}-search-btn`);
        const results = document.getElementById(`${searchId}-results`);
        
        const query = queryInput.value.trim();
        if (!query) {
            results.innerHTML = `
                <div class="rag-alert rag-alert-warning">
                    请输入搜索查询
                </div>
            `;
            return;
        }
        
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<span class="rag-loading"></span> 搜索中...';
        
        try {
            const response = await fetch(`${this.config.apiBase}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.token}`
                },
                body: JSON.stringify({
                    query: query,
                    limit: parseInt(limitSelect.value)
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'ok') {
                this.displaySearchResults(searchId, result.results, options);
            } else {
                throw new Error(result.message || '搜索失败');
            }
        } catch (error) {
            results.innerHTML = `
                <div class="rag-alert rag-alert-error">
                    搜索失败: ${error.message}
                </div>
            `;
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = '搜索';
        }
    }

    // 显示搜索结果
    displaySearchResults(searchId, results, options) {
        const resultsDiv = document.getElementById(`${searchId}-results`);
        
        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="rag-alert rag-alert-warning">
                    未找到相关结果
                </div>
            `;
            return;
        }
        
        const resultsHtml = results.map((result, index) => `
            <div class="rag-result-item" style="margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.8); border-radius: 8px; border-left: 4px solid #3498db;">
                <div class="rag-result-title" style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">
                    ${result.title || `结果 ${index + 1}`}
                </div>
                <div class="rag-result-content" style="color: #7f8c8d; font-size: 0.9em; line-height: 1.4;">
                    ${result.content}
                </div>
                <div class="rag-result-meta" style="margin-top: 10px; font-size: 0.8em; color: #95a5a6;">
                    相关度: ${(result.relevance * 100).toFixed(1)}% | 来源: ${result.source || '未知'}
                </div>
            </div>
        `).join('');
        
        resultsDiv.innerHTML = `
            <h4 style="margin: 20px 0 10px 0; color: #2c3e50;">搜索结果 (${results.length})</h4>
            ${resultsHtml}
        `;
        
        // 触发搜索完成回调
        if (options.onResults) {
            options.onResults(results);
        }
    }

    // 创建文档管理组件
    createDocumentManager(container, options = {}) {
        const managerId = 'rag-doc-manager-' + Date.now();
        const manager = document.createElement('div');
        manager.id = managerId;
        manager.className = 'rag-card';
        
        manager.innerHTML = `
            <h3>文档管理</h3>
            <div class="rag-tabs">
                <button class="rag-tab active" data-tab="list">文档列表</button>
                <button class="rag-tab" data-tab="stats">统计信息</button>
                <button class="rag-tab" data-tab="sync">同步状态</button>
            </div>
            
            <div class="rag-tab-content active" data-tab="list">
                <div id="${managerId}-documents"></div>
            </div>
            
            <div class="rag-tab-content" data-tab="stats">
                <div id="${managerId}-stats"></div>
            </div>
            
            <div class="rag-tab-content" data-tab="sync">
                <div id="${managerId}-sync"></div>
            </div>
        `;
        
        container.appendChild(manager);
        this.setupDocumentManagerEvents(managerId, options);
        this.loadDocuments(managerId);
        
        return managerId;
    }

    // 设置文档管理器事件
    setupDocumentManagerEvents(managerId, options) {
        const tabs = document.querySelectorAll(`#${managerId} .rag-tab`);
        const contents = document.querySelectorAll(`#${managerId} .rag-tab-content`);
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // 更新标签页状态
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
                
                // 加载对应内容
                if (targetTab === 'list') {
                    this.loadDocuments(managerId);
                } else if (targetTab === 'stats') {
                    this.loadStats(managerId);
                } else if (targetTab === 'sync') {
                    this.loadSyncStatus(managerId);
                }
            });
        });
    }

    // 加载文档列表
    async loadDocuments(managerId) {
        const documentsDiv = document.getElementById(`${managerId}-documents`);
        documentsDiv.innerHTML = '<div class="rag-loading"></div> 加载中...';
        
        try {
            const response = await fetch(`${this.config.apiBase}/documents`, {
                headers: {
                    'Authorization': `Bearer ${this.config.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'ok') {
                this.displayDocuments(managerId, result.documents);
            } else {
                throw new Error(result.message || '加载失败');
            }
        } catch (error) {
            documentsDiv.innerHTML = `
                <div class="rag-alert rag-alert-error">
                    加载失败: ${error.message}
                </div>
            `;
        }
    }

    // 显示文档列表
    displayDocuments(managerId, documents) {
        const documentsDiv = document.getElementById(`${managerId}-documents`);
        
        if (documents.length === 0) {
            documentsDiv.innerHTML = `
                <div class="rag-alert rag-alert-warning">
                    暂无文档
                </div>
            `;
            return;
        }
        
        const documentsHtml = documents.map(doc => `
            <div class="rag-document-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.8); border-radius: 8px; margin-bottom: 10px;">
                <div class="rag-document-info" style="flex: 1;">
                    <div class="rag-document-title" style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">
                        ${doc.title}
                    </div>
                    <div class="rag-document-meta" style="font-size: 0.8em; color: #7f8c8d;">
                        类型: ${doc.type} | 大小: ${doc.contentLength} 字符
                    </div>
                </div>
                <div class="rag-document-actions">
                    <button class="rag-btn rag-btn-primary" onclick="ragUI.viewDocument('${doc.id}')" style="margin: 0 5px;">
                        查看
                    </button>
                    <button class="rag-btn rag-btn-danger" onclick="ragUI.deleteDocument('${doc.id}')" style="margin: 0 5px;">
                        删除
                    </button>
                </div>
            </div>
        `).join('');
        
        documentsDiv.innerHTML = `
            <h4 style="margin: 20px 0 10px 0; color: #2c3e50;">文档列表 (${documents.length})</h4>
            ${documentsHtml}
        `;
    }

    // 加载统计信息
    async loadStats(managerId) {
        const statsDiv = document.getElementById(`${managerId}-stats`);
        statsDiv.innerHTML = '<div class="rag-loading"></div> 加载中...';
        
        try {
            const response = await fetch(`${this.config.apiBase}/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.config.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'ok') {
                this.displayStats(managerId, result.stats);
            } else {
                throw new Error(result.message || '加载失败');
            }
        } catch (error) {
            statsDiv.innerHTML = `
                <div class="rag-alert rag-alert-error">
                    加载失败: ${error.message}
                </div>
            `;
        }
    }

    // 显示统计信息
    displayStats(managerId, stats) {
        const statsDiv = document.getElementById(`${managerId}-stats`);
        
        statsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div class="rag-stat-item" style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
                    <div class="rag-stat-value" style="font-size: 2em; font-weight: bold;">${stats.totalDocuments || 0}</div>
                    <div class="rag-stat-label">总文档数</div>
                </div>
                <div class="rag-stat-item" style="text-align: center; padding: 20px; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; border-radius: 10px;">
                    <div class="rag-stat-value" style="font-size: 2em; font-weight: bold;">${stats.totalSize || 0}</div>
                    <div class="rag-stat-label">总大小 (KB)</div>
                </div>
                <div class="rag-stat-item" style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; border-radius: 10px;">
                    <div class="rag-stat-value" style="font-size: 2em; font-weight: bold;">${stats.avgRelevance || 0}%</div>
                    <div class="rag-stat-label">平均相关度</div>
                </div>
            </div>
        `;
    }

    // 加载同步状态
    async loadSyncStatus(managerId) {
        const syncDiv = document.getElementById(`${managerId}-sync`);
        syncDiv.innerHTML = '<div class="rag-loading"></div> 加载中...';
        
        try {
            const response = await fetch(`${this.config.apiBase}/sync-status`, {
                headers: {
                    'Authorization': `Bearer ${this.config.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'ok') {
                this.displaySyncStatus(managerId, result);
            } else {
                throw new Error(result.message || '加载失败');
            }
        } catch (error) {
            syncDiv.innerHTML = `
                <div class="rag-alert rag-alert-error">
                    加载失败: ${error.message}
                </div>
            `;
        }
    }

    // 显示同步状态
    displaySyncStatus(managerId, data) {
        const syncDiv = document.getElementById(`${managerId}-sync`);
        
        const status = data.database.status;
        const queueSize = data.queue.queueSize;
        const isProcessing = data.queue.isProcessing;
        
        syncDiv.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">数据库状态</h4>
                <div class="rag-alert ${status === 'healthy' ? 'rag-alert-success' : 'rag-alert-error'}">
                    状态: ${status === 'healthy' ? '健康' : '异常'}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px;">同步队列</h4>
                <div class="rag-alert ${queueSize === 0 ? 'rag-alert-success' : 'rag-alert-warning'}">
                    队列大小: ${queueSize} | 处理中: ${isProcessing ? '是' : '否'}
                </div>
            </div>
            
            <button class="rag-btn rag-btn-primary" onclick="ragUI.manualSync()">
                手动同步
            </button>
        `;
    }

    // 查看文档
    async viewDocument(documentId) {
        try {
            const response = await fetch(`${this.config.apiBase}/document/${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${this.config.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'ok') {
                this.showDocumentModal(result.document);
            } else {
                throw new Error(result.message || '加载失败');
            }
        } catch (error) {
            alert(`查看文档失败: ${error.message}`);
        }
    }

    // 显示文档模态框
    showDocumentModal(document) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 30px; max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50;">${document.title}</h3>
                    <button onclick="this.closest('.rag-modal').remove()" style="background: none; border: none; font-size: 1.5em; cursor: pointer;">×</button>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>类型:</strong> ${document.type} | 
                    <strong>大小:</strong> ${document.contentLength} 字符
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-family: monospace;">
                    ${document.content}
                </div>
            </div>
        `;
        
        modal.className = 'rag-modal';
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 删除文档
    async deleteDocument(documentId) {
        if (!confirm('确定要删除这个文档吗？')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.config.apiBase}/document/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.config.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'ok') {
                alert('文档删除成功');
                // 刷新文档列表
                this.loadDocuments('rag-doc-manager');
            } else {
                throw new Error(result.message || '删除失败');
            }
        } catch (error) {
            alert(`删除文档失败: ${error.message}`);
        }
    }

    // 手动同步
    async manualSync() {
        try {
            const response = await fetch(`${this.config.apiBase}/manual-sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'ok') {
                alert('手动同步已触发');
                // 刷新同步状态
                this.loadSyncStatus('rag-doc-manager');
            } else {
                throw new Error(result.message || '同步失败');
            }
        } catch (error) {
            alert(`手动同步失败: ${error.message}`);
        }
    }
}

// 全局实例
window.ragUI = new RAGUI();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RAGUI;
} 