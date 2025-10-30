import React from 'react';

interface ImportFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function ImportForm({ data, onChange }: ImportFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateFile = (resource: string, resourceValue: string) => {
    const newFile = { resource };
    if (resourceValue) {
      newFile[resource] = resourceValue;
    }
    updateField('file', newFile);
  };

  const currentResource = data.file?.resource || 'url';
  const currentValue = data.file?.[currentResource] || '';

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Import WXR File</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Import Source *
          </label>
          <select
            value={currentResource}
            onChange={(e) => {
              const resource = e.target.value;
              updateFile(resource, '');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="url">Download URL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            WXR File URL *
          </label>
          <input
            type="url"
            value={currentValue}
            onChange={(e) => updateFile('url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/export.xml"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL to a WordPress export file (.xml format)
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">WordPress Export (WXR)</h3>
          <p className="text-sm text-green-700 mb-2">
            WXR files contain posts, pages, comments, custom fields, categories, and tags exported from a WordPress site.
          </p>
          <p className="text-xs text-green-600">
            You can create a WXR file by going to Tools → Export in your WordPress admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}