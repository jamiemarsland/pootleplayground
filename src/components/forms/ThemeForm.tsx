import React from 'react';

interface ThemeFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function ThemeForm({ data, onChange }: ThemeFormProps) {
  // Helper function to detect WordPress.org theme URLs and extract slug
  const detectWordPressOrgTheme = (url: string) => {
    const wpOrgPattern = /https?:\/\/wordpress\.org\/themes\/([^\/]+)\/?/;
    const match = url.match(wpOrgPattern);
    return match ? match[1] : null;
  };

  // Handle URL input with smart detection
  const handleUrlInput = (url: string) => {
    const slug = detectWordPressOrgTheme(url);
    if (slug) {
      // Auto-convert to WordPress.org theme
      updateThemeZipFile('wordpress.org/themes', slug);
    } else {
      // Use as direct URL
      updateThemeZipFile('url', url);
    }
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateThemeZipFile = (resource: string, resourceValue: string) => {
    const newThemeZipFile = { resource };
    if (resourceValue) {
      newThemeZipFile[resource] = resourceValue;
    }
    updateField('themeZipFile', newThemeZipFile);
  };

  const updateOption = (option: string, value: any) => {
    const options = { ...data.options };
    if (value === false || value === '' || value === null) {
      delete options[option];
    } else {
      options[option] = value;
    }
    onChange({ ...data, options });
  };

  const currentResource = data.themeZipFile?.resource || 'url';
  const currentValue = data.themeZipFile?.[currentResource] || '';

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Install Theme</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Theme Source *
          </label>
          <select
            value={currentResource}
            onChange={(e) => {
              const resource = e.target.value;
              updateThemeZipFile(resource, '');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="url">Download URL</option>
            <option value="wordpress.org/themes">WordPress.org Theme</option>
          </select>
        </div>

        {currentResource === 'url' ? (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Theme ZIP URL *
            </label>
            <input
              type="url"
              value={currentValue}
              onChange={(e) => handleUrlInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/theme.zip or https://wordpress.org/themes/theme-name/"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a direct ZIP download URL or a WordPress.org theme page URL (will auto-detect)
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Theme Slug *
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => updateThemeZipFile('wordpress.org/themes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="theme-slug"
            />
            <p className="text-xs text-gray-500 mt-1">
              The theme directory name from wordpress.org (e.g., "twentytwentyfour")
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Options</h3>
          <h3 className="text-sm font-medium text-white">Options</h3>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activate"
              checked={data.options?.activate !== false}
              onChange={(e) => updateOption('activate', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="activate" className="text-sm text-gray-700">
              Activate theme after installation
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}