'use client';

import { useState } from 'react';
import { ArrowLeft, Sparkles, Lightbulb, Target, Users } from 'lucide-react';

interface PromptEditorProps {
  onSubmit: (prompt: string) => void;
  onBack: () => void;
}

const promptSuggestions = [
  "Create a carousel about the benefits of remote work",
  "Design a product launch announcement for our new app",
  "Make an educational series about sustainable living tips",
  "Create a motivational carousel for entrepreneurs",
  "Design a behind-the-scenes look at our company culture"
];

const promptTemplates = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "Product Launch",
    description: "Announce your new product with compelling visuals",
    template: "Launch our new [product name] that helps [target audience] [solve problem]. Key features: [feature 1], [feature 2], [feature 3]. Call to action: [CTA]"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Educational",
    description: "Share knowledge in an engaging format",
    template: "Teach [audience] about [topic]. Cover: [point 1], [point 2], [point 3]. Include examples and actionable tips."
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Tips & Tricks",
    description: "Share valuable insights with your audience",
    template: "[Number] tips for [topic] that [audience] should know. Include: [tip 1], [tip 2], [tip 3]. End with encouragement."
  }
];

export default function PromptEditor({ onSubmit, onBack }: PromptEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleTemplateSelect = (template: string) => {
    setPrompt(template);
    setSelectedTemplate(template);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Write Your Prompt</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tell Us Your Story
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Describe what you want your carousel to be about. Be specific about your message, audience, and goals.
            </p>
          </div>

          {/* Prompt Input */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Your Prompt</h3>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your carousel content here... For example: 'Create a carousel about the benefits of remote work for digital nomads. Include tips on productivity, work-life balance, and travel destinations.'"
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {prompt.length} characters
              </span>
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Carousel
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Suggestions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(suggestion)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                >
                  <p className="text-gray-700">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Or Use a Template</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {promptTemplates.map((template, index) => (
                <div
                  key={index}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.template
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={() => handleTemplateSelect(template.template)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-purple-600">{template.icon}</div>
                    <h4 className="font-semibold text-gray-900">{template.title}</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                    {template.template}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Be specific about your target audience</li>
              <li>• Mention the key points you want to cover</li>
              <li>• Include your desired tone (professional, casual, humorous)</li>
              <li>• Specify any call-to-action you want included</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
