'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
}

function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

export function AnimatedCounter({ value, duration = 1500, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isFloat = typeof value === 'string' && value.includes('.');

  useEffect(() => {
    if (isNaN(numericValue)) {
      return;
    }

    const startValue = displayValue;
    const endValue = numericValue;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [numericValue, duration]);

  if (isNaN(numericValue)) {
    return <span className={className}>{value}</span>;
  }

  const formattedValue = isFloat
    ? displayValue.toFixed(1)
    : Math.round(displayValue).toLocaleString();

  return <span className={className}>{formattedValue}</span>;
}
