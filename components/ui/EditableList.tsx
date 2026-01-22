import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addButtonText?: string;
}

export function EditableList({
  items,
  onChange,
  placeholder = 'Add an item...',
  addButtonText = 'Add Item'
}: EditableListProps) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2 group">
          <span className="mt-3 text-gray-400 select-none">•</span>
          <textarea
            value={item}
            onChange={e => handleEdit(index, e.target.value)}
            rows={2}
            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="mt-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="flex items-start gap-2">
        <span className="mt-3 text-gray-300 select-none">•</span>
        <textarea
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          rows={2}
          className="flex-1 p-2 border border-dashed border-gray-300 rounded-lg text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className="mt-2 p-1 text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {items.length === 0 && !newItem && (
        <button
          type="button"
          onClick={() => document.querySelector<HTMLTextAreaElement>('textarea[placeholder]')?.focus()}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + {addButtonText}
        </button>
      )}
    </div>
  );
}

export default EditableList;
