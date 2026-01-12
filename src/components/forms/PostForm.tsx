import React from 'react';

interface PostFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function PostForm({ data, onChange }: PostFormProps) {
  // Ensure data has proper defaults
  const postData = {
    postTitle: '',
    postContent: '',
    postType: 'post',
    postStatus: 'publish',
    postDate: 'now',
    featuredImageUrl: '',
    ...data
  };

  const updateField = (field: string, value: any) => {
    const newData = { ...postData, [field]: value };
    onChange(newData);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-blueprint-text mb-6">Add Post</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Post Title *
          </label>
          <input
            type="text"
            value={postData.postTitle}
            onChange={(e) => updateField('postTitle', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Enter post title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Post Content
          </label>
          <textarea
            value={postData.postContent}
            onChange={(e) => updateField('postContent', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Enter post content (HTML supported)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Post Type
            </label>
            <select
              value={postData.postType}
              onChange={(e) => updateField('postType', e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            >
              <option value="post">Post</option>
              <option value="page">Page</option>
              <option value="custom">Custom Post Type</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Post Status
            </label>
            <select
              value={postData.postStatus}
              onChange={(e) => updateField('postStatus', e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            >
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Post Date
          </label>
          <input
            type="text"
            value={postData.postDate}
            onChange={(e) => updateField('postDate', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="now, YYYY-MM-DD, or YYYY-MM-DD HH:MM:SS"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            Use "now" for current date, or specify date in YYYY-MM-DD format
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Featured Image URL
          </label>
          <input
            type="url"
            value={postData.featuredImageUrl}
            onChange={(e) => updateField('featuredImageUrl', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            Direct URL to an image file to set as the featured image
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Post Author ID
          </label>
          <input
            type="number"
            value={postData.postAuthor || ''}
            onChange={(e) => updateField('postAuthor', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="Leave empty for default author"
          />
        </div>
      </div>
    </div>
  );
}