// 移动端性能优化工具

class MobilePerformanceOptimizer {
    constructor() {
        this.observers = new Map();
        this.performanceMetrics = {
            loadTime: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupPerformanceObserver();
        this.setupIntersectionObserver();
        this.setupTouchOptimizations();
        this.setupScrollOptimizations();
        this.setupImageOptimizations();
    }
    
    // 性能监控
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // 监控LCP (Largest Contentful Paint)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
                console.log('LCP:', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // 监控CLS (Cumulative Layout Shift)
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.performanceMetrics.cumulativeLayoutShift = clsValue;
                console.log('CLS:', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    // 懒加载优化
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            // 观察所有懒加载图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    // 触摸优化
    setupTouchOptimizations() {
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // 触摸反馈优化
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // 防止滚动时的触摸事件
        let isScrolling = false;
        document.addEventListener('scroll', () => {
            isScrolling = true;
            clearTimeout(window.scrollTimeout);
            window.scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 150);
        }, { passive: true });
    }
    
    // 滚动优化
    setupScrollOptimizations() {
        // 使用节流优化滚动事件
        let ticking = false;
        
        const updateScroll = () => {
            // 滚动时的优化逻辑
            ticking = false;
        };
        
        document.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        }, { passive: true });
    }
    
    // 图片优化
    setupImageOptimizations() {
        // 预加载关键图片
        const preloadImages = [
            // 添加需要预加载的图片URL
        ];
        
        preloadImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    // 获取性能指标
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            timestamp: Date.now()
        };
    }
    
    // 优化图片加载
    optimizeImage(img) {
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }
        
        if (img.complete) {
            this.handleImageLoad(img);
        } else {
            img.addEventListener('load', () => this.handleImageLoad(img));
        }
    }
    
    handleImageLoad(img) {
        img.classList.add('loaded');
        img.classList.remove('loading');
    }
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 移动端缓存优化
class MobileCacheOptimizer {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 50; // 最大缓存条目数
    }
    
    // 设置缓存
    set(key, value, ttl = 300000) { // 默认5分钟过期
        const item = {
            value,
            timestamp: Date.now(),
            ttl
        };
        
        // 如果缓存已满，删除最旧的条目
        if (this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, item);
    }
    
    // 获取缓存
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        // 检查是否过期
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    // 清除过期缓存
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }
    
    // 清空所有缓存
    clear() {
        this.cache.clear();
    }
}

// 移动端网络优化
class MobileNetworkOptimizer {
    constructor() {
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        this.setupNetworkOptimizations();
    }
    
    setupNetworkOptimizations() {
        if (this.connection) {
            this.connection.addEventListener('change', () => {
                this.handleConnectionChange();
            });
        }
    }
    
    handleConnectionChange() {
        const effectiveType = this.connection?.effectiveType;
        const downlink = this.connection?.downlink;
        
        console.log('网络状态变化:', { effectiveType, downlink });
        
        // 根据网络状况调整加载策略
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            this.enableLowBandwidthMode();
        } else {
            this.disableLowBandwidthMode();
        }
    }
    
    enableLowBandwidthMode() {
        // 启用低带宽模式
        document.body.classList.add('low-bandwidth');
        
        // 降低图片质量
        document.querySelectorAll('img').forEach(img => {
            if (img.dataset.lowRes) {
                img.src = img.dataset.lowRes;
            }
        });
    }
    
    disableLowBandwidthMode() {
        // 禁用低带宽模式
        document.body.classList.remove('low-bandwidth');
        
        // 恢复高质量图片
        document.querySelectorAll('img').forEach(img => {
            if (img.dataset.highRes) {
                img.src = img.dataset.highRes;
            }
        });
    }
    
    // 预加载关键资源
    preloadCriticalResources() {
        const criticalResources = [
            // 添加关键资源URL
        ];
        
        criticalResources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            document.head.appendChild(link);
        });
    }
}

// 移动端错误监控
class MobileErrorMonitor {
    constructor() {
        this.errors = [];
        this.maxErrors = 10;
        this.setupErrorHandling();
    }
    
    setupErrorHandling() {
        // 全局错误处理
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        // Promise错误处理
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason
            });
        });
        
        // 网络错误处理
        window.addEventListener('offline', () => {
            this.logError('Network Offline', {});
        });
        
        window.addEventListener('online', () => {
            this.logError('Network Online', {});
        });
    }
    
    logError(type, details) {
        const error = {
            type,
            details,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errors.push(error);
        
        // 限制错误数量
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        console.error('Mobile Error:', error);
        
        // 可以发送到错误监控服务
        this.sendToErrorService(error);
    }
    
    sendToErrorService(error) {
        // 发送错误到监控服务
        fetch('/api/error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(error)
        }).catch(() => {
            // 静默处理发送失败
        });
    }
    
    getErrors() {
        return this.errors;
    }
    
    clearErrors() {
        this.errors = [];
    }
}

// 初始化所有优化器
const mobileOptimizer = new MobilePerformanceOptimizer();
const cacheOptimizer = new MobileCacheOptimizer();
const networkOptimizer = new MobileNetworkOptimizer();
const errorMonitor = new MobileErrorMonitor();

// 导出工具函数
window.MobileOptimizer = {
    performance: mobileOptimizer,
    cache: cacheOptimizer,
    network: networkOptimizer,
    error: errorMonitor
}; 