import React, { useState } from 'react';
import { Bold, Italic, Link as LinkIcon, Smile } from 'lucide-react';

interface Variable {
  name: string;
  value: string;
}

interface RightPanelProps {
  selectedStep?: {
    id: string;
    type: string;
    content?: string;
    blockId?: string;
  };
  variables?: Variable[];
  onUpdateStep?: (id: string, content: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  selectedStep,
  variables = [],
  onUpdateStep 
}) => {
  const [content, setContent] = useState(selectedStep?.content || '');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onUpdateStep?.(selectedStep?.id || '', newContent);
  };

  const insertVariable = (variable: Variable) => {
    const variableText = `{{${variable.name}}}`;
    handleContentChange(content + variableText);
  };

  if (!selectedStep) {
    return (
      <div className="w-96 border-l border-gray-200 bg-gray-50 h-screen overflow-y-auto">
        <div className="p-4">
          <p className="text-sm text-gray-500">Select a step to configure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border-l border-gray-200 bg-gray-50 h-screen overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Step Configuration</h2>
          <p className="text-sm text-gray-500">
            {selectedStep.type === 'text' ? 'Configure text message' :
             selectedStep.type === 'image' ? 'Configure image capture' :
             'Configure component'}
          </p>
        </div>

        {selectedStep.type === 'text' && (
          <div className="space-y-4">
            {/* Text Editor Toolbar */}
            <div className="bg-white rounded-t-lg border border-gray-200 p-2 flex items-center space-x-2">
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Bold size={16} className="text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Italic size={16} className="text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <LinkIcon size={16} className="text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Smile size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Text Editor */}
            <div className="bg-white border border-gray-200 rounded-b-lg">
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full p-4 min-h-[200px] text-sm focus:outline-none"
                placeholder="Enter your message..."
              />
            </div>

            {/* Variables Section */}
            {variables.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Available Variables</h3>
                <div className="bg-white rounded-lg border border-gray-200 p-2">
                  <div className="space-y-2">
                    {variables.map((variable) => (
                      <button
                        key={variable.name}
                        onClick={() => insertVariable(variable)}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        {`{{${variable.name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedStep.type === 'image' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Capture Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Capture Type</label>
                <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm">
                  <option>Screen Capture</option>
                  <option>Camera</option>
                  <option>File Upload</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Format</label>
                <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm">
                  <option>PNG</option>
                  <option>JPEG</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {selectedStep.type === 'component' && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Component Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Component Type</label>
                <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm">
                  <option>Button</option>
                  <option>Form</option>
                  <option>Card</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button 
            className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700"
            onClick={() => onUpdateStep?.(selectedStep.id, content)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;