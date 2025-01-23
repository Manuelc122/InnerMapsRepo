const EntryTags = ({ tags, onAddTag }: { tags: string[]; onAddTag: (tag: string) => void }) => {
  const commonTags = ['gratitude', 'reflection', 'goals', 'memories', 'dreams'];
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
            #{tag}
          </span>
        ))}
      </div>
      <div className="text-sm text-gray-500">
        Suggested: {commonTags.map(tag => (
          <button 
            onClick={() => onAddTag(tag)}
            className="text-blue-500 hover:underline mx-1"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}; 