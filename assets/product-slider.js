class ProductImageSlider extends HTMLElement {
  constructor() {
    super();
    console.log('ProductSlider initialized');
    this.init();
  }

  init() {
    this.wrapper = this.querySelector('.slider-wrapper');
    this.images = this.querySelectorAll('.product-featured-image');
    console.log('Found images:', this.images.length);
    console.log('Found wrapper:', this.wrapper);
    
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;

    // Set initial styles for the wrapper and images
    if (this.images.length > 0) {
      this.wrapper.style.width = `${this.images.length * 100}%`;
      this.images.forEach(image => {
        image.style.width = `${100 / this.images.length}%`;
      });
    }
    
    // Setup navigation buttons
    const prevButton = this.closest('.product-image-container').querySelector('.prev-button');
    const nextButton = this.closest('.product-image-container').querySelector('.next-button');

    console.log('Found buttons:', { prevButton, nextButton });

    if (prevButton) {
      prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Prev button clicked');
        this.previousImage();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Next button clicked');
        this.nextImage();
      });
    }

    // Add touch event listeners
    this.wrapper.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.wrapper.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    this.wrapper.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousImage();
      } else if (e.key === 'ArrowRight') {
        this.nextImage();
      }
    });

    // Set initial state
    this.updateSliderPosition();
    this.updateNavigationButtons();
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.wrapper.style.transition = 'none';
  }

  handleTouchMove(e) {
    if (!this.touchStartX) return;
    
    const currentX = e.touches[0].clientX;
    const diff = this.touchStartX - currentX;
    
    // Add some resistance to the swipe
    const translate = -this.currentIndex * 100 - (diff / this.wrapper.offsetWidth) * 100;
    this.wrapper.style.transform = `translateX(${translate}%)`;
  }

  handleTouchEnd(e) {
    if (!this.touchStartX) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = this.touchStartX - touchEndX;
    const threshold = this.wrapper.offsetWidth * 0.2; // 20% of container width
    
    this.wrapper.style.transition = 'transform 0.3s ease-in-out';
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && this.currentIndex < this.images.length - 1) {
        this.nextImage();
      } else if (diff < 0 && this.currentIndex > 0) {
        this.previousImage();
      } else {
        this.updateSliderPosition(); // Snap back if at the end
      }
    } else {
      // Return to current image if swipe wasn't strong enough
      this.updateSliderPosition();
    }
    
    this.touchStartX = null;
  }

  nextImage() {
    if (!this.images.length) return;
    if (this.currentIndex >= this.images.length - 1) return;
    
    console.log('Next clicked, current index:', this.currentIndex);
    this.currentIndex++;
    this.updateSliderPosition();
    this.updateNavigationButtons();
    console.log('New index:', this.currentIndex);
  }

  previousImage() {
    if (!this.images.length) return;
    if (this.currentIndex <= 0) return;
    
    console.log('Previous clicked, current index:', this.currentIndex);
    this.currentIndex--;
    this.updateSliderPosition();
    this.updateNavigationButtons();
    console.log('New index:', this.currentIndex);
  }

  updateSliderPosition() {
    if (!this.wrapper) return;
    const offset = -this.currentIndex * 100;
    console.log('Updating position to:', offset, 'Current index:', this.currentIndex);
    this.wrapper.style.transition = 'transform 0.3s ease-in-out';
    this.wrapper.style.transform = `translateX(${offset}%)`;
  }

  updateNavigationButtons() {
    const prevButton = this.closest('.product-image-container').querySelector('.prev-button');
    const nextButton = this.closest('.product-image-container').querySelector('.next-button');

    if (prevButton) {
      prevButton.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
      prevButton.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
    }

    if (nextButton) {
      nextButton.style.opacity = this.currentIndex === this.images.length - 1 ? '0.5' : '1';
      nextButton.style.pointerEvents = this.currentIndex === this.images.length - 1 ? 'none' : 'auto';
    }
  }
}

if (!customElements.get('product-image-slider')) {
  customElements.define('product-image-slider', ProductImageSlider);
}

document.addEventListener('DOMContentLoaded', function() {
  const sliderContainer = document.querySelector('.slider-container');
  const sliderWrapper = document.querySelector('.slider-wrapper');
  const slides = sliderWrapper.querySelectorAll('img');
  let currentSlide = 0;
  let slideWidth = sliderContainer.offsetWidth;

  // On mobile, remove lazy-loading so off-screen images load immediately
  if (window.innerWidth <= 768) {
    slides.forEach(slide => {
      slide.removeAttribute('loading');
    });
  }

  function updateSlider() {
    // Recalculate slide width based on the container width
    slideWidth = sliderContainer.offsetWidth;
    // Set each slide's width so they line up correctly
    slides.forEach(slide => {
      slide.style.width = slideWidth + 'px';
    });
    // Set the width of the wrapper to fit all slides
    sliderWrapper.style.width = (slideWidth * slides.length) + 'px';
    // Update the transform to the current slide using the new width
    sliderWrapper.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
  }

  // Initialize slider dimensions on load
  updateSlider();

  // Recalculate dimensions on window resize
  window.addEventListener('resize', updateSlider);

  // Navigation: Move to the next slide
  document.querySelector('.next-button').addEventListener('click', function() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      sliderWrapper.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
      // On mobile, ensure the newly active slide has no lazy-loading
      if (window.innerWidth <= 768) {
        slides[currentSlide].removeAttribute('loading');
      }
    }
  });

  // Navigation: Move to the previous slide
  document.querySelector('.prev-button').addEventListener('click', function() {
    if (currentSlide > 0) {
      currentSlide--;
      sliderWrapper.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
      if (window.innerWidth <= 768) {
        slides[currentSlide].removeAttribute('loading');
      }
    }
  });
}); 