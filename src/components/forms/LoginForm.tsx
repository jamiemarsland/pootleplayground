import React from 'react';

interface LoginFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function LoginForm({ data, onChange }: LoginFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Login Configuration</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Username *
          </label>
          <input
            type="text"
            value={data.username || 'admin'}
            onChange={(e) => updateField('username', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="admin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Password *
          </label>
          <input
            type="password"
            value={data.password || 'password'}
            onChange={(e) => updateField('password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="password"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Login Step</h3>
          <p className="text-sm text-blue-700">
            This step automatically logs in with the specified credentials when the playground loads. 
            This is useful for setting up a site that's ready to use without requiring manual login.
          </p>
        </div>
      </div>
    </div>
  );
}