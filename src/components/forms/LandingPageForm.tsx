import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LandingPageFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function LandingPageForm({ data, onChange }: LandingPageFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const showCustomUrlInput = data.landingPageType === 'custom';

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-blueprint-text mb-6 flex items-center gap-2">
        <ExternalLink size={20} />
        Set Landing Page
      </h2>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Landing Page Configuration</h3>
          <p className="text-sm text-blue-700">
            Choose where visitors will land when your WordPress Playground loads. This affects the initial 
            URL that opens in the browser.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Landing Page Type *
          </label>
          <select
            value={data.landingPageType || 'wp-admin'}
            onChange={(e) => updateField('landingPageType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="wp-admin">WordPress Admin Dashboard</option>
            <option value="front-page">Website Front Page</option>
            <option value="custom">Custom URL</option>
          </select>
        </div>

        {showCustomUrlInput && (
          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Custom URL *
            </label>
            <input
              type="text"
              value={data.customUrl || ''}
              onChange={(e) => updateField('customUrl', e.target.value)}
              placeholder="/wp-admin/edit.php"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Enter a custom WordPress URL path. Examples: <code className="bg-gray-100 px-1 py-0.5 rounded">/wp-admin/edit.php</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">/about</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">/wp-admin/themes.php</code>
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Landing Page Options</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <div>
              <strong>WordPress Admin:</strong> Opens directly to the WordPress admin dashboard (/wp-admin/).
              Perfect for development and configuration tasks.
            </div>
            <div>
              <strong>Front Page:</strong> Opens to the public-facing website homepage (/).
              Great for showing the final result to clients or visitors.
            </div>
            <div>
              <strong>Custom URL:</strong> Opens to any specific WordPress URL you define.
              Useful for opening directly to a specific admin page, custom page, or post.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}