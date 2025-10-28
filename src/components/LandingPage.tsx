'use client';

import { ArrowRight, Sparkles, Palette, Zap, Download } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header removed - consolidated into global navbar */}

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Create Stunning
            <span className="text-gradient-instagram"> Instagram Carousels</span>
            <br />
            with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your ideas into engaging Instagram carousels in minutes. 
            Choose from professional templates, write your story, and let AI generate beautiful content for you.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose CarouselGen?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Styles</h3>
              <p className="text-gray-600">
                Choose from Kalshi-style, meme templates, educational layouts, and more to match your brand.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Simply write your prompt and let our AI generate compelling content and visuals for your carousel.
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Export</h3>
              <p className="text-gray-600">
                Download your carousels in high resolution, ready to post on Instagram and other social platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Create Your First Carousel?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators who are already using CarouselGen to grow their Instagram presence.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">$0</p>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>Basic templates</li>
                <li>Up to 3 exports</li>
                <li>Community support</li>
              </ul>
              <button onClick={onGetStarted} className="w-full bg-white text-gray-900 border rounded-lg py-3 font-semibold">Get Started</button>
            </div>
            <div className="p-8 rounded-2xl border-2 border-purple-600 bg-white shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
              <p className="text-4xl font-bold text-gray-900 mb-1">$12</p>
              <p className="text-sm text-gray-500 mb-4">per month</p>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>All styles</li>
                <li>Unlimited exports</li>
                <li>Priority support</li>
              </ul>
              <button onClick={onGetStarted} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg py-3 font-semibold">Start Pro</button>
            </div>
            <div className="p-8 rounded-2xl border bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team</h3>
              <p className="text-4xl font-bold text-gray-900 mb-1">$29</p>
              <p className="text-sm text-gray-500 mb-4">per month</p>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>Collaboration</li>
                <li>Brand assets</li>
                <li>Analytics</li>
              </ul>
              <button onClick={onGetStarted} className="w-full bg-white text-gray-900 border rounded-lg py-3 font-semibold">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Content Matters</h2>
          <p className="text-lg text-gray-700 leading-8">
            Consistent, valuable content is how you build trust, create conversations, and
            stay top-of-mind with your audience. Whether youre educating your niche,
            sharing insights, or telling stories, carousels make complex ideas easy to
            digest. Great content sparks engagement, and engagement drives growth.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2025 CarouselGen. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
