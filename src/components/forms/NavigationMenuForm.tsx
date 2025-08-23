import React, { useState } from 'react';
import { Plus, Minus, Menu, ExternalLink, FileText } from 'lucide-react';
import { Step } from '../../types/blueprint';

interface NavigationMenuFormProps {
  data: any;
  onChange: (data: any) => void;
  allSteps: Step[];
}

interface MenuItem {
  id: string;
  type: 'page' | 'custom';
  pageStepId?: string;
  title: string;
  url?: string;
}

export function NavigationMenuForm({ data, onChange, allSteps }: NavigationMenuFormProps) {
  const [newItemType, setNewItemType] = useState<'page' | 'custom'>('page');

  const menuData = {
    menuName: 'Main Menu',
    menuLocation: 'primary',
    menuItems: [],
    ...data
  };

  const updateField = (field: string, value: any) => {
    onChange({ ...menuData, [field]: value });
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: `menu-item-${Date.now()}`,
      type: newItemType,
      title: newItemType === 'page' ? '' : 'Custom Link',
      ...(newItemType === 'custom' && { url: '' })
    };

    updateField('menuItems', [...menuData.menuItems, newItem]);
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    const updatedItems = menuData.menuItems.map((item: MenuItem) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateField('menuItems', updatedItems);
  };

  const removeMenuItem = (itemId: string) => {
    const filteredItems = menuData.menuItems.filter((item: MenuItem) => item.id !== itemId);
    updateField('menuItems', filteredItems);
  };

  const moveMenuItem = (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = menuData.menuItems.findIndex((item: MenuItem) => item.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= menuData.menuItems.length) return;

    const newItems = [...menuData.menuItems];
    [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];
    updateField('menuItems', newItems);
  };

  // Find all page creation steps in the blueprint
  const existingPages = allSteps
    .filter(step => step.type === 'addPage' && step.data.postTitle)
    .map(step => ({
      stepId: step.id,
      title: step.data.postTitle
    }));

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Menu size={20} />
        Create Navigation Menu
      </h2>
      
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-purple-900 mb-2">Navigation Menu Builder</h3>
          <p className="text-sm text-purple-700">
            Create a custom navigation menu with links to your pages and external sites. 
            The menu will be assigned to your theme's specified location.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Menu Name *
            </label>
            <input
              type="text"
              value={menuData.menuName}
              onChange={(e) => updateField('menuName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Main Menu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Menu Location *
            </label>
            <select
              value={menuData.menuLocation}
              onChange={(e) => updateField('menuLocation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="primary">Primary Menu</option>
              <option value="secondary">Secondary Menu</option>
              <option value="footer">Footer Menu</option>
              <option value="social">Social Menu</option>
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white mb-4">
            Menu Items ({menuData.menuItems.length})
          </h3>
          
          {menuData.menuItems.length === 0 ? (
            <p className="text-sm text-gray-500 italic mb-4">No menu items added yet</p>
          ) : (
            <div className="space-y-3 mb-4">
              {menuData.menuItems.map((item: MenuItem, index: number) => (
                <div key={item.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-md">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveMenuItem(item.id, 'up')}
                      disabled={index === 0}
                      className="w-6 h-6 flex items-center justify-center text-xs bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveMenuItem(item.id, 'down')}
                      disabled={index === menuData.menuItems.length - 1}
                      className="w-6 h-6 flex items-center justify-center text-xs bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    >
                      ↓
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500 bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    {item.type === 'page' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-green-600" />
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 gap-3">
                    {item.type === 'page' ? (
                      <>
                        <select
                          value={item.pageStepId || ''}
                          onChange={(e) => {
                            const selectedStep = allSteps.find(s => s.id === e.target.value);
                            updateMenuItem(item.id, {
                              pageStepId: e.target.value,
                              title: selectedStep ? selectedStep.data.postTitle : ''
                            });
                          }}
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select a page...</option>
                          {existingPages.map(page => (
                            <option key={page.stepId} value={page.stepId}>
                              {page.title}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateMenuItem(item.id, { title: e.target.value })}
                          placeholder="Link title"
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="url"
                          value={item.url || ''}
                          onChange={(e) => updateMenuItem(item.id, { url: e.target.value })}
                          placeholder="https://example.com"
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeMenuItem(item.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex gap-3">
              <select
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value as 'page' | 'custom')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="page">Link to Page</option>
                <option value="custom">Custom Link</option>
              </select>
              
              <button
                onClick={addMenuItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Menu Locations</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• <strong>Primary:</strong> Main navigation (usually in header)</p>
            <p>• <strong>Secondary:</strong> Additional navigation area</p>
            <p>• <strong>Footer:</strong> Links in the footer area</p>
            <p>• <strong>Social:</strong> Social media links</p>
          </div>
        </div>
      </div>
    </div>
  );
}