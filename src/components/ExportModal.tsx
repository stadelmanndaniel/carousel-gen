'use client';

import { useState } from 'react';
import { X, Download, Instagram, FileText, Image, Check } from 'lucide-react';
import { Carousel } from '@/types';

interface ExportModalProps {
  carousel: Carousel;
  onClose: () => void;
}

export default function ExportModal({ carousel, onClose }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'individual' | 'pdf' | 'zip'>('individual');
  const [exportSize, setExportSize] = useState<'instagram' | 'square' | 'custom'>('instagram');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Mock export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExporting(false);
    setExportComplete(true);
    
    // In a real app, this would trigger actual file downloads
    console.log('Exporting carousel:', {
      format: exportFormat,
      size: exportSize,
      slides: carousel.slides.length
    });
  };

  const downloadMockFile = (filename: string) => {
    // Mock download - in real app this would download actual files
    const link = document.createElement('a');
    link.href = '#';
    link.download = filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Export Carousel</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!exportComplete ? (
            <>
              {/* Carousel Preview */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Carousel Preview</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {carousel.slides.length}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{carousel.title}</h4>
                      <p className="text-sm text-gray-600">{carousel.style.name} • {carousel.slides.length} slides</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Format */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setExportFormat('individual')}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      exportFormat === 'individual'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Image className="w-6 h-6 text-purple-600" />
                      <span className="font-medium text-gray-900">Individual Images</span>
                    </div>
                    <p className="text-sm text-gray-600">Download each slide as a separate image file</p>
                  </button>

                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      exportFormat === 'pdf'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-6 h-6 text-purple-600" />
                      <span className="font-medium text-gray-900">PDF Document</span>
                    </div>
                    <p className="text-sm text-gray-600">All slides in a single PDF file</p>
                  </button>

                  <button
                    onClick={() => setExportFormat('zip')}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      exportFormat === 'zip'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Download className="w-6 h-6 text-purple-600" />
                      <span className="font-medium text-gray-900">ZIP Archive</span>
                    </div>
                    <p className="text-sm text-gray-600">All files compressed in a ZIP folder</p>
                  </button>
                </div>
              </div>

              {/* Export Size */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Size</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="size"
                      value="instagram"
                      checked={exportSize === 'instagram'}
                      onChange={() => setExportSize('instagram')}
                      className="text-purple-600"
                    />
                    <Instagram className="w-5 h-5 text-gray-600" />
                    <div>
                      <span className="font-medium text-gray-900">Instagram Optimized</span>
                      <p className="text-sm text-gray-600">1080x1080px (Square)</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="size"
                      value="square"
                      checked={exportSize === 'square'}
                      onChange={() => setExportSize('square')}
                      className="text-purple-600"
                    />
                    <Image className="w-5 h-5 text-gray-600" />
                    <div>
                      <span className="font-medium text-gray-900">Square Format</span>
                      <p className="text-sm text-gray-600">1024x1024px</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="size"
                      value="custom"
                      checked={exportSize === 'custom'}
                      onChange={() => setExportSize('custom')}
                      className="text-purple-600"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Custom Size</span>
                      <p className="text-sm text-gray-600">Specify your own dimensions</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex space-x-4">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isExporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Export Carousel</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            /* Export Complete */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Complete!</h3>
              <p className="text-gray-600 mb-6">
                Your carousel has been exported successfully. The files should start downloading automatically.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => downloadMockFile(`${carousel.title}-slides.zip`)}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Download Again
                </button>
                <button
                  onClick={onClose}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
