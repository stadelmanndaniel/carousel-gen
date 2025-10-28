'use client';

import { useState } from 'react';
import { ArrowLeft, Sparkles, Lightbulb, Target, Users, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showTips, setShowTips] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showTemplates, setShowTemplates] = useState(true);

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
      {/* Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Styles</span>
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Customize Your Carousel
            </h1>
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
            {/* Inline Pro Tips inside the prompt card */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <button
                type="button"
                onClick={() => setShowTips((v) => !v)}
                className="w-full flex items-center justify-between text-left"
                aria-expanded={showTips}
                aria-controls="pro-tips-list"
              >
                <span className="font-semibold text-blue-900 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Pro Tips
                </span>
                <span className="text-blue-900">
                  {showTips ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </span>
              </button>
              {showTips && (
                <ul id="pro-tips-list" className="mt-2 text-blue-800 space-y-1 text-sm">
                  <li>• Be specific about your target audience</li>
                  <li>• Mention the key points you want to cover</li>
                  <li>• Include your desired tone (professional, casual, humorous)</li>
                  <li>• Specify any call-to-action you want included</li>
                </ul>
              )}
            </div>
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
            <button
              type="button"
              onClick={() => setShowSuggestions((v) => !v)}
              className="w-full flex items-center justify-between text-left mb-4"
              aria-expanded={showSuggestions}
              aria-controls="quick-suggestions"
            >
              <h3 className="text-xl font-semibold text-gray-900">Quick Suggestions</h3>
              <span className="text-gray-700">
                {showSuggestions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {showSuggestions && (
              <div id="quick-suggestions" className="grid md:grid-cols-2 gap-4">
                {promptSuggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                  >
                    <p className="text-gray-700">{suggestion}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <button
              type="button"
              onClick={() => setShowTemplates((v) => !v)}
              className="w-full flex items-center justify-between text-left mb-6"
              aria-expanded={showTemplates}
              aria-controls="prompt-templates"
            >
              <h3 className="text-xl font-semibold text-gray-900">Use a Template</h3>
              <span className="text-gray-700">
                {showTemplates ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {showTemplates && (
              <div id="prompt-templates" className="grid md:grid-cols-3 gap-6">
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
