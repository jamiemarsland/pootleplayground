import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface WpConfigFormProps {
  data: any;
  onChange: (data: any) => void;
}

export function WpConfigForm({ data, onChange }: WpConfigFormProps) {
  const [newConstName, setNewConstName] = useState('');
  const [newConstValue, setNewConstValue] = useState('');

  const consts = data.consts || {};

  const addConstant = () => {
    if (newConstName.trim()) {
      const updatedConsts = { ...consts, [newConstName]: parseValue(newConstValue) };
      onChange({ ...data, consts: updatedConsts });
      setNewConstName('');
      setNewConstValue('');
    }
  };

  const removeConstant = (constName: string) => {
    const updatedConsts = { ...consts };
    delete updatedConsts[constName];
    onChange({ ...data, consts: updatedConsts });
  };

  const updateConstant = (constName: string, value: string) => {
    const updatedConsts = { ...consts, [constName]: parseValue(value) };
    onChange({ ...data, consts: updatedConsts });
  };

  const parseValue = (value: string) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value)) && value !== '') return Number(value);
    return value;
  };

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    return value;
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Define WP Config Constants</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Current Constants</h3>
          <h3 className="text-sm font-medium text-white mb-4">Current Constants</h3>
          {Object.keys(consts).length === 0 ? (
            <p className="text-sm text-gray-500 italic">No constants defined yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(consts).map(([name, value]) => (
                <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Constant Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        disabled
                        className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={formatValue(value)}
                        onChange={(e) => updateConstant(name, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeConstant(name)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Add New Constant</h3>
          <h3 className="text-sm font-medium text-white mb-4">Add New Constant</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newConstName}
                onChange={(e) => setNewConstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Constant name (e.g., WP_DEBUG)"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={newConstValue}
                onChange={(e) => setNewConstValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Value (true, false, string, number)"
              />
            </div>
            <button
              onClick={addConstant}
              disabled={!newConstName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Common Constants</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700">
            <div><code>WP_DEBUG</code> - Enable debug mode</div>
            <div><code>WP_DEBUG_LOG</code> - Log errors to file</div>
            <div><code>WP_DEBUG_DISPLAY</code> - Display errors</div>
            <div><code>SCRIPT_DEBUG</code> - Use dev versions of scripts</div>
            <div><code>WP_MEMORY_LIMIT</code> - Memory limit</div>
            <div><code>DISALLOW_FILE_EDIT</code> - Disable file editing</div>
          </div>
        </div>
      </div>
    </div>
  );
}