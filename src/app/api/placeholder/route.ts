import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const width = searchParams.get('width') || '400';
  const height = searchParams.get('height') || '400';
  const text = searchParams.get('text') || 'Image';
  
  // Redirect to a placeholder service
  const placeholderUrl = `https://via.placeholder.com/${width}x${height}/6366f1/ffffff?text=${encodeURIComponent(text)}`;
  
  return NextResponse.redirect(placeholderUrl);
}
