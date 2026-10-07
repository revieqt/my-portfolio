import React, { useEffect, useRef, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

interface LazyLoadingImageProps
  extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Tailwind / custom classes for the wrapper
   */
  wrapperClassName?: string;

  /**
   * Tailwind / custom classes for the image
   */
  imageClassName?: string;

  /**
   * Enable or disable lazy loading
   * Default: true
   */
  enableLazyLoading?: boolean;

  /**
   * IntersectionObserver root margin
   * Default: "100px"
   */
  rootMargin?: string;

  /**
   * IntersectionObserver threshold
   * Default: 0.1
   */
  threshold?: number;

  /**
   * Optional placeholder image
   */
  placeholderSrc?: string;
}

const LazyLoadingImage: React.FC<LazyLoadingImageProps> = ({
  src,
  alt = '',
  wrapperClassName = '',
  imageClassName = '',
  enableLazyLoading = true,
  rootMargin = '100px',
  threshold = 0.1,
  placeholderSrc,
  loading,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isVisible, setIsVisible] = useState(!enableLazyLoading);

  useEffect(() => {
    if (!enableLazyLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [enableLazyLoading, rootMargin, threshold]);

  return (
    <div ref={containerRef} className={wrapperClassName}>
      {(isVisible || !enableLazyLoading) && (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          loading={loading ?? 'lazy'}
          {...props}
        />
      )}

      {!isVisible && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt="placeholder"
          className={imageClassName}
        />
      )}
    </div>
  );
};

export default LazyLoadingImage;