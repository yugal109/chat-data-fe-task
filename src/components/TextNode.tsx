import { memo, useState, useRef, useEffect } from 'react';

interface TextNodeProps {
  data: {
    text: string;
    onChange: (text: string) => void;
    onContextMenu?: (e: React.MouseEvent) => void;
  };
  selected?: boolean;
}

const TextNode = ({ data, selected }: TextNodeProps) => {
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode for new nodes
  const textRef = useRef<HTMLDivElement>(null);
  const isNewNode = useRef(true);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  useEffect(() => {
    // After the first render, mark the node as not new
    if (isNewNode.current) {
      isNewNode.current = false;
    }
  }, []);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isNewNode.current) { // Only handle double click for existing nodes
      setIsEditing(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Get the innerHTML to preserve line breaks
    const newText = e.target.innerHTML.replace(/<div>/g, '\n').replace(/<\/div>/g, '').replace(/<br>/g, '\n');
    data.onChange?.(newText);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Insert a line break
      document.execCommand('insertLineBreak');
    }
  };

  return (
    <div 
      className={`group min-w-[50px] ${
        selected ? 'ring-1 ring-gray-200 bg-white/50 rounded-sm' : ''
      } ${
        isEditing ? 'ring-2 ring-blue-400 rounded-sm' : ''
      }`}
      onContextMenu={(e) => {
        e.stopPropagation();
        data.onContextMenu?.(e);
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div 
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={`text-xs outline-none px-2 py-1 rounded whitespace-pre-wrap break-words ${
          isEditing 
            ? 'cursor-text focus:outline-none' 
            : 'cursor-move'
        }`}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: (data.text || 'Text').replace(/\n/g, '<br>') }}
        style={{ 
          minHeight: '1.5em',
          lineHeight: '1.5',
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default memo(TextNode);