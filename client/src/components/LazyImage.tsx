import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  width?: number;
  height?: number;
}

/**
 * Lazy-loaded image component with Intersection Observer
 * Only loads image when it enters the viewport
 */
export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholderClassName = 'bg-gray-200 dark:bg-gray-800',
  width,
  height 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {!isLoaded && (
        <div 
          className={cn('absolute inset-0 animate-pulse', placeholderClassName)}
          aria-label="Loading..."
        />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        width={width}
        height={height}
      />
    </div>
  );
}
