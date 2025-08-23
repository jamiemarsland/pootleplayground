import React from 'react';

interface PageFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function PageForm({ data, onChange }: PageFormProps) {
  // Ensure data has proper defaults for pages
  const pageData = {
    postTitle: '',
    postContent: '',
    postStatus: 'publish',
    postParent: '',
    postName: '', // slug
    ...data
  };

  const updateField = (field: string, value: any) => {
    const newData = { ...pageData, [field]: value };
    onChange(newData);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-blueprint-text mb-6">Add Page</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Page Title *
          </label>
          <input
            type="text"
            value={pageData.postTitle}
            onChange={(e) => updateField('postTitle', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Enter page title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Page Content
          </label>
          <textarea
            value={pageData.postContent}
            onChange={(e) => updateField('postContent', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Enter page content (HTML and Gutenberg block markup supported)"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            You can paste Gutenberg block markup directly here
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Page Status
            </label>
            <select
              value={pageData.postStatus}
              onChange={(e) => updateField('postStatus', e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            >
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Page Slug
            </label>
            <input
              type="text"
              value={pageData.postName}
              onChange={(e) => updateField('postName', e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
              placeholder="page-slug (leave empty for auto-generation)"
            />
            <p className="text-xs text-blueprint-text/60 mt-1">
              URL-friendly version of the title
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Parent Page ID
          </label>
          <input
            type="number"
            value={pageData.postParent}
            onChange={(e) => updateField('postParent', e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Leave empty for top-level page"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            ID of the parent page for hierarchical structure
          </p>
        </div>

        <div className="blueprint-component border rounded-md p-4">
          <h3 className="text-sm font-medium text-blueprint-text mb-2">Gutenberg Block Support</h3>
          <p className="text-sm text-blueprint-text/80 mb-2">
            You can paste Gutenberg block markup directly into the content area. For example:
          </p>
          <code className="text-xs text-blueprint-accent bg-blueprint-paper/50 p-2 rounded block">
            &lt;!-- wp:paragraph --&gt;<br/>
            &lt;p&gt;Your content here&lt;/p&gt;<br/>
            &lt;!-- /wp:paragraph --&gt;
          </code>
        </div>
      </div>
    </div>
  );
}