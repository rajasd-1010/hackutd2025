import React, { useState, useEffect } from 'react';

const heroImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1920&h=1080&fit=crop',
    title: '2025 Toyota Camry',
    subtitle: 'Efficiency Meets Performance',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&h=1080&fit=crop',
    title: '2025 Toyota RAV4',
    subtitle: 'Adventure Awaits',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920&h=1080&fit=crop',
    title: '2025 Toyota Corolla',
    subtitle: 'Smart. Efficient. Connected.',
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  return (
    <section 
      className="relative h-screen w-full overflow-hidden"
      role="banner"
      aria-label="Hero carousel"
    >
      {/* Background Images with Ken Burns Effect */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={index !== currentIndex}
          >
            <div
              className="absolute inset-0 bg-cover bg-center animate-ken-burns"
              style={{
                backgroundImage: `url(${image.url})`,
              }}
            />
            {/* Overlay for legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
            {heroImages[currentIndex].title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-lg">
            {heroImages[currentIndex].subtitle}
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Explore Vehicles
            </button>
            <button className="btn-outline text-lg px-8 py-4">
              Build & Price
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20"
        role="tablist"
        aria-label="Carousel navigation"
      >
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-toyota-red'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === currentIndex}
            role="tab"
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <svg
          className="w-6 h-6 text-white/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

// Add Ken Burns animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes ken-burns {
    0% {
      transform: scale(1) translate(0, 0);
    }
    100% {
      transform: scale(1.1) translate(-2%, -2%);
    }
  }
  .animate-ken-burns {
    animation: ken-burns 20s ease-in-out infinite alternate;
  }
`;
document.head.appendChild(style);

export default HeroSection;

