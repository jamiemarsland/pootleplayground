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
          </select>
        </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}