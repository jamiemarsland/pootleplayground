import React from 'react';
import { Home } from 'lucide-react';
import { Step } from '../../types/blueprint';

interface HomepageFormProps {
  data: any;
  onChange: (data: any) => void;
  allSteps: Step[];
}

export function HomepageForm({ data, onChange, allSteps }: HomepageFormProps) {
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
        <Home size={20} />
        Set Home Page
      </h2>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Home Page Configuration</h3>
          <p className="text-sm text-blue-700">
            Configure which page should be displayed as your website's homepage instead of showing 
            the latest blog posts.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Homepage Option
          </label>
          <select
            value={data.option || 'create'}
            onChange={(e) => updateField('option', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="create">Create new "Home" page</option>
            {existingPages.length > 0 && (
              <option value="existing">Use existing page from blueprint</option>
            )}
          </select>
        </div>

        {data.option === 'create' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Homepage Title
              </label>
              <input
                type="text"
                value={data.title || 'Home'}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Home"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Homepage Content
              </label>
              <textarea
                value={data.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Welcome to our website! This is the homepage content. You can paste Gutenberg block markup here."
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports HTML and Gutenberg block markup
              </p>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Choose Homepage
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
            <p>• Sets <code>show_on_front</code> to "page"</p>
            <p>• Sets <code>page_on_front</code> to your homepage ID</p>
          </div>
        </div>
      </div>
    </div>
  );
}