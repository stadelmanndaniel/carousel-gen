'use client';

import { Carousel } from '@/types';
import { BarChart3, TrendingUp, Calendar, Zap, Target, Award } from 'lucide-react';

interface UsageStatsProps {
  user: any;
  carousels: Carousel[];
}

export default function UsageStats({ user, carousels }: UsageStatsProps) {
  // Calculate statistics
  const totalCarousels = carousels.length;
  const totalSlides = carousels.reduce((sum, carousel) => sum + carousel.slides.length, 0);
  
  // Group carousels by month for chart data
  const carouselsByMonth = carousels.reduce((acc, carousel) => {
    const month = new Date(carousel.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }).reverse();

  // Most used style
  const styleUsage = carousels.reduce((acc, carousel) => {
    acc[carousel.style.name] = (acc[carousel.style.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedStyle = Object.entries(styleUsage).sort(([,a], [,b]) => b - a)[0];

  // Mock usage limits (would come from user's plan)
  const usageLimits = {
    monthlyCarousels: 50,
    totalCarousels: 200,
    storage: '5GB'
  };

  const monthlyUsage = last6Months.map(month => carouselsByMonth[month] || 0);
  const maxUsage = Math.max(...monthlyUsage, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usage Statistics</h1>
        <p className="text-gray-600 mt-1">Track your carousel creation and usage patterns</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Carousels</p>
              <p className="text-2xl font-bold text-gray-900">{totalCarousels}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Slides</p>
              <p className="text-2xl font-bold text-gray-900">{totalSlides}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {carouselsByMonth[new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })] || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Slides</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCarousels > 0 ? Math.round(totalSlides / totalCarousels) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Usage Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage</h3>
          <div className="space-y-4">
            {last6Months.map((month, index) => {
              const usage = monthlyUsage[index];
              const percentage = (usage / maxUsage) * 100;
              
              return (
                <div key={month} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{month}</span>
                    <span className="font-medium text-gray-900">{usage}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Style Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Style Preferences</h3>
          <div className="space-y-4">
            {Object.entries(styleUsage)
              .sort(([,a], [,b]) => b - a)
              .map(([style, count]) => (
                <div key={style} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{style}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / totalCarousels) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            {totalCarousels === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No carousels created yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Monthly Carousels</h4>
            <p className="text-2xl font-bold text-gray-900">
              {carouselsByMonth[new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })] || 0}
            </p>
            <p className="text-sm text-gray-600">of {usageLimits.monthlyCarousels} limit</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ 
                  width: `${Math.min(
                    ((carouselsByMonth[new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })] || 0) / usageLimits.monthlyCarousels) * 100,
                    100
                  )}%` 
                }}
              />
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Total Carousels</h4>
            <p className="text-2xl font-bold text-gray-900">{totalCarousels}</p>
            <p className="text-sm text-gray-600">of {usageLimits.totalCarousels} limit</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ 
                  width: `${Math.min((totalCarousels / usageLimits.totalCarousels) * 100, 100)}%` 
                }}
              />
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Storage Used</h4>
            <p className="text-2xl font-bold text-gray-900">2.1GB</p>
            <p className="text-sm text-gray-600">of {usageLimits.storage} limit</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: '42%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {carousels
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((carousel) => (
              <div key={carousel.id} className="flex items-center space-x-3 py-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Created &ldquo;{carousel.title}&rdquo;</p>
                  <p className="text-xs text-gray-500">
                    {new Date(carousel.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {carousel.style.name}
                </span>
              </div>
            ))}
          {totalCarousels === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
