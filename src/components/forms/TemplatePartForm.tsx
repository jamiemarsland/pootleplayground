import React from 'react';

interface TemplatePartFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function TemplatePartForm({ data, onChange }: TemplatePartFormProps) {
  // Ensure data has proper defaults for template parts
  const templatePartData = {
    postTitle: '',
    postContent: '',
    postStatus: 'publish',
    postName: '', // template part slug
    theme: '',
    area: '',
    ...data
  };

  const updateField = (field: string, value: any) => {
    const newData = { ...templatePartData, [field]: value };
    onChange(newData);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-blueprint-text mb-6">Add Template Part</h2>
      
      <div className="space-y-6">
        <div className="blueprint-component border rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blueprint-text mb-2">Site Editor Template Part</h3>
          <p className="text-sm text-blueprint-text/80">
            Add a reusable template part created in the WordPress Site Editor. Template parts 
            are reusable sections like headers, footers, and sidebars used across multiple templates.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Template Part Name *
          </label>
          <input
            type="text"
            value={templatePartData.postTitle}
            onChange={(e) => updateField('postTitle', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="e.g., Custom Header, Footer, Sidebar"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Template Part Slug *
            </label>
            <input
              type="text"
              value={templatePartData.postName}
              onChange={(e) => updateField('postName', e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
              placeholder="e.g., header, footer, sidebar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Template Area
            </label>
            <select
              value={templatePartData.area}
              onChange={(e) => updateField('area', e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            >
              <option value="">No specific area</option>
              <option value="header">Header</option>
              <option value="footer">Footer</option>
              <option value="sidebar">Sidebar</option>
              <option value="uncategorized">Uncategorized</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Theme
          </label>
          <input
            type="text"
            value={templatePartData.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Theme name (leave empty for active theme)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Template Part Content *
          </label>
          <textarea
            value={templatePartData.postContent}
            onChange={(e) => updateField('postContent', e.target.value)}
            rows={10}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent font-mono text-sm"
            placeholder="<!-- wp:site-title /-->&#10;&#10;<!-- wp:navigation /-->"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            Full Site Editing template part HTML markup with Gutenberg blocks
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Status
          </label>
          <select
            value={templatePartData.postStatus}
            onChange={(e) => updateField('postStatus', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
          >
            <option value="publish">Published</option>
            <option value="draft">Draft</option>
            <option value="auto-draft">Auto Draft</option>
          </select>
        </div>
      </div>
    </div>
  );
}