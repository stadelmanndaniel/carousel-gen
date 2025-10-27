export interface CarouselStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'business' | 'meme' | 'educational' | 'lifestyle' | 'kalshi';
  colors: string[];
}

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  text: string;
  position: number;
  backgroundColor?: string;
  textColor?: string;
}

export interface Carousel {
  id: string;
  title: string;
  style: CarouselStyle;
  slides: CarouselSlide[];
  prompt: string;
  createdAt: Date;
}

export interface UserSettings {
  logo?: string;
  brandColors: string[];
  defaultFont: string;
}
