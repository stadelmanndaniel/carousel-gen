import { CarouselStyle } from '@/types';

export const carouselStyles: CarouselStyle[] = [
  {
    id: 'kalshi-style',
    name: 'Kalshi Style',
    description: 'Clean, professional design perfect for financial and investment content',
    preview: '/images/kalshi-preview.png',
    category: 'kalshi',
    colors: ['#1a365d', '#2d3748', '#4a5568', '#718096']
  },
  {
    id: 'meme-style',
    name: 'Meme Style',
    description: 'Fun, viral-ready designs with bold colors and playful typography',
    preview: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=400&fit=crop&crop=center',
    category: 'meme',
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Clear, informative layouts ideal for tutorials and how-to content',
    preview: '/images/educational-preview.png',
    category: 'educational',
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Professional corporate style with clean lines and corporate colors',
    preview: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=400&fit=crop&crop=center',
    category: 'business',
    colors: ['#2c3e50', '#34495e', '#3498db', '#2980b9']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'Modern, trendy designs perfect for lifestyle and personal brands',
    preview: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=400&fit=crop&crop=center',
    category: 'lifestyle',
    colors: ['#ff9a9e', '#fecfef', '#fecfef', '#ffecd2']
  }
];

export const mockSlides = [
  {
    id: 'slide-1',
    imageUrl: '/api/placeholder/400/400',
    text: 'Welcome to our amazing product!',
    position: 1,
    backgroundColor: '#ffffff',
    textColor: '#000000'
  },
  {
    id: 'slide-2',
    imageUrl: '/api/placeholder/400/400',
    text: 'Here are the key features that make us special',
    position: 2,
    backgroundColor: '#f8f9fa',
    textColor: '#333333'
  },
  {
    id: 'slide-3',
    imageUrl: '/api/placeholder/400/400',
    text: 'See how our customers are loving it',
    position: 3,
    backgroundColor: '#e9ecef',
    textColor: '#495057'
  },
  {
    id: 'slide-4',
    imageUrl: '/api/placeholder/400/400',
    text: 'Ready to get started? Click the link below!',
    position: 4,
    backgroundColor: '#dee2e6',
    textColor: '#6c757d'
  }
];
