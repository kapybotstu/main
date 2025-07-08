class ImageLazyLoader {
  constructor() {
    this.observer = null;
    this.callbacks = new Map();
    this.loadedImages = new Set();
    this.init();
  }

  init() {
    this.observer = new IntersectionObserver(
      this.handleIntersect.bind(this),
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
  }

  handleIntersect(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const callback = this.callbacks.get(element);
      
      if (callback && entry.isIntersecting) {
        callback(entry);
      }
    });
  }

  observe(element, callback) {
    if (!element || !callback) return;
    
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element) {
    if (!element) return;
    
    this.callbacks.delete(element);
    this.observer.unobserve(element);
  }

  markAsLoaded(imageUrl) {
    if (imageUrl) {
      this.loadedImages.add(imageUrl);
    }
  }

  isAlreadyLoaded(imageUrl) {
    return this.loadedImages.has(imageUrl);
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
      this.loadedImages.clear();
    }
  }
}

export default new ImageLazyLoader();