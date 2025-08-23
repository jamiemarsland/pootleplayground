import React from 'react';

interface ClientRoleFormProps {
  data: any;
  onChange: (data: any) => void;
}

const COMMON_CAPABILITIES = [
  'read',
  'edit_posts',
  'edit_published_posts',
  'edit_others_posts',
  'publish_posts',
  'delete_posts',
  'delete_published_posts',
  'delete_others_posts',
  'edit_pages',
  'edit_published_pages',
  'edit_others_pages',
  'publish_pages',
  'delete_pages',
  'delete_published_pages',
  'delete_others_pages',
  'read_private_posts',
  'read_private_pages',
  'edit_private_posts',
  'edit_private_pages',
  'delete_private_posts',
  'delete_private_pages',
  'manage_categories',
  'manage_links',
  'moderate_comments',
  'upload_files',
  'edit_comments',
  'edit_others_comments',
  'delete_comments',
  'delete_others_comments',
  'edit_themes',
  'install_themes',
  'switch_themes',
  'edit_theme_options',
  'delete_themes',
  'install_plugins',
  'activate_plugins',
  'edit_plugins',
  'delete_plugins',
  'edit_users',
  'create_users',
  'delete_users',
  'list_users',
  'promote_users',
  'remove_users',
  'add_users',
  'manage_options',
  'import',
  'unfiltered_html',
  'edit_dashboard',
  'update_plugins',
  'delete_site',
];

export function ClientRoleForm({ data, onChange }: ClientRoleFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleCapability = (capability: string) => {
    const capabilities = data.capabilities || [];
    const hasCapability = capabilities.includes(capability);
    
    if (hasCapability) {
      updateField('capabilities', capabilities.filter((cap: string) => cap !== capability));
    } else {
      updateField('capabilities', [...capabilities, capability]);
    }
  };

  const capabilities = data.capabilities || [];

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Add Client Role</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Role Name *
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Client, Custom Editor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-4">
            Capabilities ({capabilities.length} selected)
          </label>
          
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-4 bg-gray-50">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Posts & Pages</h4>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_CAPABILITIES.filter(cap => cap.includes('post') || cap.includes('page')).map(capability => (
                    <label key={capability} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={capabilities.includes(capability)}
                        onChange={() => toggleCapability(capability)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <code className="text-xs">{capability}</code>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Media & Comments</h4>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_CAPABILITIES.filter(cap => 
                    cap.includes('comment') || cap.includes('upload') || cap.includes('media')
                  ).map(capability => (
                    <label key={capability} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={capabilities.includes(capability)}
                        onChange={() => toggleCapability(capability)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <code className="text-xs">{capability}</code>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Themes & Plugins</h4>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_CAPABILITIES.filter(cap => 
                    cap.includes('theme') || cap.includes('plugin')
                  ).map(capability => (
                    <label key={capability} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={capabilities.includes(capability)}
                        onChange={() => toggleCapability(capability)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <code className="text-xs">{capability}</code>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Users & Admin</h4>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_CAPABILITIES.filter(cap => 
                    cap.includes('user') || cap === 'manage_options' || cap === 'read' || cap.includes('unfiltered')
                  ).map(capability => (
                    <label key={capability} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={capabilities.includes(capability)}
                        onChange={() => toggleCapability(capability)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <code className="text-xs">{capability}</code>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-2">Custom User Role</h3>
          <p className="text-sm text-purple-700">
            Create a custom user role with specific capabilities. This is useful for creating client accounts 
            with limited permissions or specialized user types for your WordPress site.
          </p>
        </div>
      </div>
    </div>
  );
}