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
      <h2 className="text-lg font-semibold text-blueprint-text mb-6">Login Configuration</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Username *
          </label>
          <input
            type="text"
            value={data.username || 'admin'}
            onChange={(e) => updateField('username', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="admin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Password *
          </label>
          <input
            type="password"
            value={data.password || 'password'}
            onChange={(e) => updateField('password', e.target.value)}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
            placeholder="password"
          />
        </div>

        <div className="blueprint-component border rounded-md p-4">
          <h3 className="text-sm font-medium text-blueprint-text mb-2">Login Step</h3>
          <p className="text-sm text-blueprint-text/80">
            This step automatically logs in with the specified credentials when the playground loads. 
            This is useful for setting up a site that's ready to use without requiring manual login.
          </p>
        </div>
      </div>
    </div>
  );
}