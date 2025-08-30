import React from 'react';

interface TemplateFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function TemplateForm({ data, onChange }: TemplateFormProps) {
  // Ensure data has proper defaults for templates
  const templateData = {
    postTitle: '',
    postContent: '',
    postStatus: 'publish',
    postName: '', // template slug
    theme: '',
    templateType: 'wp_template',
    ...data
  };

  const updateField = (field: string, value: any) => {
    const newData = { ...templateData, [field]: value };
    onChange(newData);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-blueprint-text mb-6">Add Template</h2>
      
      <div className="space-y-6">
        <div className="blueprint-component border rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blueprint-text mb-2">Site Editor Template</h3>
          <p className="text-sm text-blueprint-text/80">
            Add a custom template created in the WordPress Site Editor. These templates control 
            the layout and design of different parts of your site using Full Site Editing.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Template Name *
          </label>
          <input
            type="text"
            value={templateData.postTitle}
            onChange={(e) => updateField('postTitle', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="e.g., Custom Home Template, Single Post Template"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Template Slug *
          </label>
          <input
            type="text"
            value={templateData.postName}
            onChange={(e) => updateField('postName', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="e.g., home, single, page, archive"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            Template hierarchy name (home, single, page, archive, etc.)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Theme
          </label>
          <input
            type="text"
            value={templateData.theme}
            onChange={(e) => updateField('theme', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Theme name (leave empty for active theme)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Template Content *
          </label>
          <textarea
            value={templateData.postContent}
            onChange={(e) => updateField('postContent', e.target.value)}
            rows={12}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent font-mono text-sm"
            placeholder="<!-- wp:template-part {&quot;slug&quot;:&quot;header&quot;} /-->&#10;&#10;<!-- wp:group -->"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            Full Site Editing template HTML markup with Gutenberg blocks
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Status
          </label>
          <select
            value={templateData.postStatus}
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