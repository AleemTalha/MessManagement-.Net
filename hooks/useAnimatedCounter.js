"use client"
import { useEffect, useState, useRef } from 'react'

export function useAnimatedCounter(end, duration = 2000, startTrigger = true) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!startTrigger || hasAnimated.current) return

    hasAnimated.current = true
    const startTime = Date.now()
    const endValue = parseInt(end)

    const updateCounter = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(easeOutQuart * endValue)
      
      countRef.current = currentCount
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(updateCounter)
  }, [end, duration, startTrigger])

  return count
}

export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenInView) {
          setIsInView(true)
          setHasBeenInView(true)
        }
      },
      {
        threshold: options.threshold || 0.1,
        ...options
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [hasBeenInView, options])

  return [ref, isInView]
}
