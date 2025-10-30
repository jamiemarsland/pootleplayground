import React from 'react';

interface MediaFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function MediaForm({ data, onChange }: MediaFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-blueprint-text mb-6">Add Media</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Media URL *
          </label>
          <input
            type="url"
            value={data.downloadUrl || ''}
            onChange={(e) => updateField('downloadUrl', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            Direct URL to the media file (image, video, audio, document)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Alternative Title
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Custom title for the media file"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            Leave empty to use the filename as title
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Alt Text (for images)
          </label>
          <input
            type="text"
            value={data.altText || ''}
            onChange={(e) => updateField('altText', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Descriptive text for accessibility"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Caption
          </label>
          <textarea
            value={data.caption || ''}
            onChange={(e) => updateField('caption', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Optional caption for the media"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Description
          </label>
          <textarea
            value={data.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Detailed description of the media"
          />
        </div>
      </div>
    </div>
  );
}