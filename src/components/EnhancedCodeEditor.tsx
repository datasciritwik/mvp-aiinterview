import React, { useState, useRef } from 'react';
import { languageOptions } from '../utils/language';

interface ExecutableEditorProps {
  initialLanguage?: string;
  initialCode?: string;
  onChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  onExecuteComplete?: (output: any, error: string | null) => void;
}

const ExecutableEditor: React.FC<ExecutableEditorProps> = ({
  initialLanguage = 'javascript',
  initialCode,
  onChange,
  onLanguageChange,
  onExecuteComplete
}) => {
  const defaultLanguage = languageOptions.find(l => l.value === initialLanguage) || languageOptions.find(l => l.value === 'javascript')!;
  
  const [language, setLanguage] = useState(defaultLanguage.value);
  const [code, setCode] = useState(initialCode || defaultLanguage.default);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    const languageOption = languageOptions.find(l => l.value === newLanguage);
    
    if (!code.trim() || code === defaultLanguage.default) {
      const newDefaultCode = languageOption?.default || '';
      setCode(newDefaultCode);
      if (onChange) {
        onChange(newDefaultCode);
      }
    }
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };
  
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
      <div className="bg-gray-800 p-2 flex items-center justify-between">
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="bg-gray-700 text-white px-3 py-1 rounded outline-none"
        >
          {languageOptions.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      
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