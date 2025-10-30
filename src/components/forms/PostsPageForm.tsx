import React from 'react';
import { FileText } from 'lucide-react';
import { Step } from '../../types/blueprint';

interface PostsPageFormProps {
  data: any;
  onChange: (data: any) => void;
  allSteps: Step[];
}

export function PostsPageForm({ data, onChange, allSteps }: PostsPageFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // Find all page creation steps in the blueprint
  const existingPages = allSteps
    .filter(step => step.type === 'addPage' && step.data.postTitle)
    .map((step, index) => ({
      stepId: step.id,
      title: step.data.postTitle,
      // Calculate the likely ID this page will have
      // WordPress starts page IDs at 2, and increments for each post/page
      estimatedId: 2 + allSteps.findIndex(s => s.id === step.id)
    }));

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <FileText size={20} />
        Set Posts Page
      </h2>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-green-900 mb-2">Blog Posts Page Configuration</h3>
          <p className="text-sm text-green-700">
            Configure which page should display your blog posts. This is where visitors will go 
            to see all your blog posts when you have a static homepage.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Posts Page Option
          </label>
          <select
            value={data.option || 'create'}
            onChange={(e) => updateField('option', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="create">Create new "Blog" page</option>
            {existingPages.length > 0 && (
              <option value="existing">Use existing page from blueprint</option>
            )}
          </select>
        </div>

        {data.option === 'create' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Posts Page Title
              </label>
              <input
                type="text"
                value={data.title || 'Blog'}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Blog"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Posts Page Content
              </label>
              <textarea
                value={data.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="This page will show all blog posts. You can add introductory content here."
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports HTML and Gutenberg block markup
              </p>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Choose Posts Page
            </label>
            {existingPages.length > 0 ? (
              <select
                value={data.stepId || ''}
                onChange={(e) => updateField('stepId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a page...</option>
                {existingPages.map(page => (
                  <option key={page.stepId} value={page.stepId}>
                    {page.title} (will be ID #{page.estimatedId})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No pages found in blueprint. Add a page first or choose "Create new" option above.
              </p>
            )}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">How it works</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Creates the specified page (if "Create new" is selected)</p>
            <p>• Sets <code>page_for_posts</code> to your posts page ID</p>
            <p className="text-xs mt-2 text-yellow-600">
              Note: You'll also need to set a homepage to complete the static homepage setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}