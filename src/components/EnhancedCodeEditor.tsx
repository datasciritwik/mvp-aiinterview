import React, { useState, useRef } from 'react';
import { languageOptions } from '../utils/language';

interface ExecutableEditorProps {
  initialCode?: string;
  onChange?: (code: string) => void;
}

const ExecutableEditor: React.FC<ExecutableEditorProps> = ({
  initialCode,
  onChange
}) => {
  const defaultLanguage = languageOptions.find(l => l.value === 'javascript')!;
  const [code, setCode] = useState(initialCode || defaultLanguage.default);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };
  
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      
      setTimeout(() => {
        if (textarea) {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }
      }, 0);
      
      if (onChange) {
        onChange(newCode);
      }
    }
  };

  return (
    <div className="executable-editor flex flex-col h-full">      
      <div className="flex-1 relative">
        <textarea
          ref={editorRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleTabKey}
          className="w-full h-full bg-gray-900 text-white font-mono p-4 resize-none outline-none"
          spellCheck="false"
          placeholder="Write your code here..."
        />
      </div>
    </div>
  );
};

export default ExecutableEditor;