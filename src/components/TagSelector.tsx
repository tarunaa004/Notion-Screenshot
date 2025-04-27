import React from 'react';
import { Tag as TagIcon } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
}

function TagSelector({ selectedTags, setSelectedTags, availableTags }: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
        <TagIcon className="w-4 h-4" />
        Tags
      </label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
        {availableTags.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No tags available. Add them in the extension settings.
          </p>
        )}
      </div>
    </div>
  );
}

export default TagSelector;