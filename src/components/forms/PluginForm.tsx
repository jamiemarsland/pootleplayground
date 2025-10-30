import React from 'react';

interface PluginFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function PluginForm({ data, onChange }: PluginFormProps) {
  // Ensure data has the right structure
  const pluginData = {
    pluginZipFile: { resource: 'url', url: '', ...data?.pluginZipFile },
    options: { activate: true, ...data?.options },
    ...data
  };

  // Helper function to detect WordPress.org plugin URLs and extract slug
  const detectWordPressOrgPlugin = (url: string) => {
    const wpOrgPattern = /https?:\/\/wordpress\.org\/plugins\/([^\/]+)\/?/;
    const match = url.match(wpOrgPattern);
    return match ? match[1] : null;
  };

  // Handle URL input with smart detection
  const handleUrlInput = (url: string) => {
    // Only detect WordPress.org plugin pages, not download URLs
    const wpOrgPagePattern = /https?:\/\/wordpress\.org\/plugins\/([^\/]+)\/?$/;
    const match = url.match(wpOrgPagePattern);
    
    if (match) {
      const slug = match[1];
      // Auto-convert to WordPress.org plugin
      const newPluginZipFile = { 
        resource: 'wordpress.org/plugins', 
        'wordpress.org/plugins': slug 
      };
      const newData = { ...pluginData, pluginZipFile: newPluginZipFile };
      onChange(newData);
    } else {
      // Use as direct URL for everything else
      updatePluginZipFile('url', url);
    }
  };

  const updateField = (field: string, value: any) => {
    const newData = { ...pluginData, [field]: value };
    onChange(newData);
  };

  const updatePluginZipFile = (resource: string, resourceValue: string) => {
    const newPluginZipFile = { 
      resource, 
      [resource]: resourceValue 
    };
    const newData = { ...pluginData, pluginZipFile: newPluginZipFile };
    onChange(newData);
  };

  const updateOption = (option: string, value: any) => {
    const options = { ...pluginData.options };
    if (value === false || value === '' || value === null) {
      delete options[option];
    } else {
      options[option] = value;
    }
    const newData = { ...pluginData, options };
    onChange(newData);
  };

  const currentResource = pluginData.pluginZipFile?.resource || 'url';
  const currentValue = pluginData.pluginZipFile?.[currentResource] || '';

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-blueprint-text mb-6">Install Plugin</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Plugin Source *
          </label>
          <select
            value={currentResource}
            onChange={(e) => {
              const resource = e.target.value;
              updatePluginZipFile(resource, '');
            }}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
          >
            <option value="url">Download URL</option>
            <option value="wordpress.org/plugins">WordPress.org Plugin</option>
          </select>
        </div>

        {currentResource === 'url' ? (
          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Plugin ZIP URL *
            </label>
            <input
              type="url"
              value={currentValue}
              onChange={(e) => handleUrlInput(e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
              placeholder="https://example.com/plugin.zip or https://wordpress.org/plugins/plugin-name/"
            />
            <p className="text-xs text-blueprint-text/60 mt-1">
              Enter a direct ZIP download URL or a WordPress.org plugin page URL (will auto-detect)
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Plugin Slug *
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => updatePluginZipFile('wordpress.org/plugins', e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
              placeholder="plugin-slug"
            />
            <p className="text-xs text-blueprint-text/60 mt-1">
              The plugin directory name from wordpress.org (e.g., "contact-form-7")
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-blueprint-text">Options</h3>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activate"
              checked={pluginData.options?.activate !== false}
              onChange={(e) => updateOption('activate', e.target.checked)}
              className="w-4 h-4 text-blueprint-accent bg-blueprint-paper border-blueprint-grid rounded focus:ring-blueprint-accent focus:ring-2"
            />
            <label htmlFor="activate" className="text-sm text-blueprint-text">
              Activate plugin after installation
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}