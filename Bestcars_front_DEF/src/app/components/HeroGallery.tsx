import React, { useState, useEffect, useCallback, useRef } from 'react';
import Slider from 'react-slick';
import { Maximize, X, Loader2 } from 'lucide-react';

// React Slick requires slick-carousel CSS
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { groupImagesByOrientation, isMobileDevice } from '../../utils/vehicleUtils';

interface HeroGalleryProps {
  images: string[];
}

export function HeroGallery({ images }: HeroGalleryProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [processedImages, setProcessedImages] = useState<{
    horizontal: string[];
    verticalGroups: string[][];
  } | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(true);
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());

  const sliderRef = useRef<Slider>(null);
  const fullscreenSliderRef = useRef<Slider>(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 350,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,

    fade: true,
    cssEase: 'ease-in-out',

    autoplay: false,
    autoplaySpeed: 0,
    pauseOnHover: false,
    pauseOnFocus: false,
    beforeChange: (_current: number, next: number) => {
      setCurrentSlide(next);
      if (fullscreenSliderRef.current) {
        fullscreenSliderRef.current.slickGoTo(next);
      }
    },
  };

  const fullscreenSettings = {
    ...settings,
    initialSlide: currentSlide,
    beforeChange: (_current: number, next: number) => {
      setCurrentSlide(next);
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(next);
      }
    },
  };

  // Generate slides combining horizontal images and vertical groups
  const generateSlides = () => {
    if (!processedImages) return [];

    const slides: React.JSX.Element[] = [];

    // Add horizontal images (one per slide)
    processedImages.horizontal.forEach((image, index) => {
      slides.push(
        <div key={`horizontal-${index}`} className="single-image-slide">
          <img src={image} alt={`Car image ${index + 1}`} loading="lazy" />
        </div>
      );
    });

    // Add vertical groups (one group per slide, max 3 images)
    processedImages.verticalGroups.forEach((group, groupIndex) => {
      slides.push(
        <div key={`vertical-group-${groupIndex}`} className="vertical-group-slide">
          <div className="vertical-images-grid">
            {group.map((image, imageIndex) => (
              <div key={imageIndex} className="vertical-image-container">
                <img src={image} alt={`Car image vertical ${groupIndex * 3 + imageIndex + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      );
    });

    return slides;
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreen(false);
    document.body.style.overflow = '';
  }, []);

  // Handle Escape key to close fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleCloseFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isFullscreen, handleCloseFullscreen]);

  // Sync sliders when entering fullscreen
  useEffect(() => {
    if (isFullscreen && fullscreenSliderRef.current) {
      fullscreenSliderRef.current.slickGoTo(currentSlide);
    }
  }, [isFullscreen, currentSlide]);

  // Handle window resize to detect mobile/desktop changes
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = isMobileDevice();
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Process images on mount/change or when mobile state changes
  useEffect(() => {
    const processImages = async () => {
      if (!images || images.length === 0) {
        setProcessedImages(null);
        setIsProcessingImages(false);
        return;
      }

      setIsProcessingImages(true);
      try {
        const grouped = await groupImagesByOrientation(images, isMobile);
        setProcessedImages(grouped);
      } catch (error) {
        console.error('Error processing images:', error);
        // Fallback to treating all as horizontal
        setProcessedImages({ horizontal: images, verticalGroups: [] });
      } finally {
        setIsProcessingImages(false);
      }
    };

    processImages();
  }, [images, isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!images || images.length === 0 || isProcessingImages) {
    return (
      <div className="relative h-[clamp(380px,48vw,600px)] rounded-[28px] overflow-hidden flex items-center justify-center bg-black/30">
        <Loader2 className="w-8 h-8 text-white/70 animate-spin" />
      </div>
    );
  }

  if (!processedImages) {
    return (
      <div className="relative h-[clamp(380px,48vw,600px)] rounded-[28px] overflow-hidden flex items-center justify-center bg-black/30">
        <Loader2 className="w-8 h-8 text-white/70 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="hero-gallery relative h-[clamp(380px,48vw,600px)] rounded-[28px] overflow-hidden bg-neutral-900/40">
        {/* Fullscreen Button */}
        <button
          onClick={handleFullscreen}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 border border-white/20 hover:border-white/30"
          aria-label="Ver en pantalla completa"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Maximize className="w-5 h-5 text-white" />
        </button>

        <style>{`
          /* ---------------------------- NORMAL (non-fullscreen) ---------------------------- */
          .hero-gallery .slick-slider,
          .hero-gallery .slick-list,
          .hero-gallery .slick-slide {
            height: 100%;
          }

          /* KEY: make the track a flex row and center items vertically */
          .hero-gallery .slick-track {
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
          }

          /* KEY: each slick slide is also flex-centered */
          .hero-gallery .slick-slide {
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          /* Center BOTH wrapper levels that react-slick creates
             IMPORTANT: make wrapper background transparent to reduce “black panel” feeling */
          .hero-gallery .slick-slide > div {
            height: 100% !important;
            width: 100%;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: transparent !important;
          }

          .hero-gallery .slick-slide > div > div {
            height: 100% !important;
            width: 100%;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .hero-gallery .slick-slide img {
            display: block;
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            margin: auto;
            object-fit: contain;
            object-position: center;
          }

          /* Vertical image groups */
          .vertical-group-slide {
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .vertical-images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            max-width: 90%;
            max-height: 90%;
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
          }

          .vertical-image-container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 200px;
            border-radius: 12px;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.1);
          }

          .vertical-image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }

          /* Single image slides (horizontal images) */
          .single-image-slide {
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 12px;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.1);
            margin: 20px;
          }

          .single-image-slide img {
            border-radius: 12px;
          }

          .hero-gallery .slick-dots {
            bottom: 20px;
          }

          .hero-gallery .slick-dots li button:before {
            color: white;
            opacity: 0.5;
          }

          .hero-gallery .slick-dots li.slick-active button:before {
            opacity: 1;
          }

          .hero-gallery .slick-prev,
          .hero-gallery .slick-next {
            z-index: 2;
            width: 30px;
            height: 30px;
            margin: 0;
            padding: 0;
            transform: none;
          }

          .hero-gallery .slick-prev {
            left: 10px !important;
            right: auto !important;
          }

          .hero-gallery .slick-next {
            right: 10px !important;
            left: auto !important;
          }

          .hero-gallery .slick-prev:before,
          .hero-gallery .slick-next:before {
            color: white;
            font-size: 30px;
            margin: 0;
            padding: 0;
          }

          /* ---------------------------- FULLSCREEN (mobile-safe height) ---------------------------- */
          .fullscreen-slider.slick-slider {
            height: 100vh;
            height: 100dvh;
          }

          .fullscreen-slider .slick-list,
          .fullscreen-slider .slick-slide {
            height: 100vh;
            height: 100dvh;
          }

          .fullscreen-slider .slick-track {
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
          }

          .fullscreen-slider .slick-slide {
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .fullscreen-slider .slick-slide > div,
          .fullscreen-slider .slick-slide > div > div {
            height: 100% !important;
            width: 100%;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: transparent !important;
          }

          .fullscreen-slider .slick-slide img {
            max-width: 100vw;
            max-height: 100vh;
            max-height: 100dvh;
            width: auto;
            height: auto;
            margin: auto;
            object-fit: contain;
            object-position: center;
          }

          /* Fullscreen vertical image groups */
          .fullscreen-slider .vertical-group-slide {
            height: 100vh !important;
            height: 100dvh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: black !important;
          }

          .fullscreen-slider .vertical-images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            max-width: 95vw;
            max-height: 90vh;
            max-height: 90dvh;
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
          }

          .fullscreen-slider .vertical-image-container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 250px;
            border-radius: 16px;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.1);
          }

          .fullscreen-slider .vertical-image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }

          /* Fullscreen single image slides */
          .fullscreen-slider .single-image-slide {
            height: 100vh !important;
            height: 100dvh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: black !important;
          }

          .fullscreen-slider .single-image-slide img {
            max-width: 95vw;
            max-height: 90vh;
            max-height: 90dvh;
            border-radius: 16px;
          }

          .fullscreen-slider .slick-prev,
          .fullscreen-slider .slick-next {
            width: 40px;
            height: 40px;
            margin: 0;
            padding: 0;
            transform: none;
          }

          .fullscreen-slider .slick-prev:before,
          .fullscreen-slider .slick-next:before {
            font-size: 40px;
            margin: 0;
            padding: 0;
          }

          .fullscreen-slider .slick-prev {
            left: 10px !important;
            right: auto !important;
          }

          .fullscreen-slider .slick-next {
            right: 10px !important;
            left: auto !important;
          }

          .fullscreen-slider .slick-dots {
            bottom: 30px;
          }

          .fullscreen-slider {
            position: relative;
          }

          /* Ensure arrows always render above the transformed track/list */
          .fullscreen-slider .slick-prev,
          .fullscreen-slider .slick-next {
            z-index: 9999 !important;
          }

          /* Keep the moving parts below the arrows */
          .fullscreen-slider .slick-list,
          .fullscreen-slider .slick-track {
            z-index: 0 !important;
          }

          /* Sometimes the slide/image can intercept touches; keep arrows clickable */
          .fullscreen-slider .slick-prev,
          .fullscreen-slider .slick-next {
            pointer-events: auto;
          }

          /* Stabilize rendering on iOS when transforms are involved */
          .fullscreen-slider .slick-list {
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
          }
        `}</style>

        <Slider ref={sliderRef} {...settings}>
          {generateSlides()}
        </Slider>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[9999] bg-black"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 z-10 p-3 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 border border-white/20 hover:border-white/30"
            aria-label="Cerrar pantalla completa"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Fullscreen Slider */}
          <div className="w-full h-full">
            <Slider
              ref={fullscreenSliderRef}
              {...fullscreenSettings}
              className="fullscreen-slider"
            >
              {generateSlides()}
            </Slider>
          </div>
        </div>
      )}
    </>
  );
}
