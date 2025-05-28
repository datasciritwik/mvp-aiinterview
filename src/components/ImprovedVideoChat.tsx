import React, { useState, useRef, useEffect } from 'react';
import { Video, StopCircle } from 'lucide-react';
import ExecutableEditor from './EnhancedCodeEditor';
import { languageOptions } from '../utils/language';

interface Message {
  type: 'user' | 'assistant' | 'system';
  text: string;
}

const VideoChatWithExecution: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [code, setCode] = useState(languageOptions[1].default);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const webcamRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Auto-scroll logs to bottom when new messages are added
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const setupMediaRecorder = (stream: MediaStream) => {
    try {
      const options = { mimeType: getSupportedMimeType() };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            saveRecordingLocally(blob);
            recordedChunksRef.current = [];
          }
        } catch (error) {
          console.error("Error handling recording completion:", error);
          addMessage('system', `Error handling recording: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      };

      mediaRecorder.start(1000);
    } catch (err) {
      console.error("Error setting up MediaRecorder:", err);
      throw err;
    }
  };

  const startRecording = async () => {
    try {
      setStreamError(null);
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      webcamStreamRef.current = webcamStream;
      if (webcamRef.current) {
        webcamRef.current.srcObject = webcamStream;
        webcamRef.current.muted = true;
      }

      setupMediaRecorder(webcamStream);
      setIsRecording(true);
      addMessage('system', 'Recording started');
    } catch (err) {
      let errorMessage = "Failed to start recording";
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = "Permission denied. Please allow access to camera.";
        } else if (err.name === 'NotFoundError') {
          errorMessage = "Camera not found. Please check your connection.";
        } else if (err.name === 'NotReadableError') {
          errorMessage = "Could not access your camera. It might be in use by another application.";
        } else if (err.name === 'NotSupportedError') {
          errorMessage = "Your browser doesn't support the required recording features.";
        } else {
          errorMessage = err.message;
        }
      }
      
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
      
      console.error("Error starting recording:", err);
      setStreamError(errorMessage);
      addMessage('system', `Recording error: ${errorMessage}`);
    }
  };

  const getSupportedMimeType = () => {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      return 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      return 'video/webm;codecs=vp8';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      return 'video/webm';
    } else {
      return '';
    }
  };

  const saveRecordingLocally = (blob: Blob) => {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const fileName = `interview-recording-${new Date().toISOString()}.webm`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error saving recording locally:', err);
      addMessage('system', `Error saving locally: ${err instanceof Error ? err.message : "Unknown error occurred"}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    addMessage('system', 'Recording stopped');
  };

  const addMessage = (type: 'user' | 'assistant' | 'system', text: string) => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left side - Code Editor */}
      <div className="w-3/5 border-r border-gray-700">
        <div className="h-screen flex flex-col">
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
            <div className="flex items-center">
              <span className="text-white font-medium">Code Editor</span>
            </div>
            <button className="px-4 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
              Submit Code
            </button>
          </div>
          <div className="flex-1">
            <ExecutableEditor
              initialCode={code}
              onChange={setCode}
            />
          </div>
        </div>
      </div>

      {/* Right side - Video and Chat */}
      <div className="w-2/5 flex flex-col h-screen">
        {/* Video Preview */}
        <div className="relative bg-gray-800 h-64">
          <video
            ref={webcamRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={true}
          />
          {!isRecording && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              {streamError ? (
                <p className="text-red-400 text-sm px-6 text-center">{streamError}</p>
              ) : (
                <Video className="w-16 h-16 text-gray-400 opacity-50" />
              )}
            </div>
          )}
          
          {/* Recording Timer */}
          {isRecording && (
            <div className="absolute top-4 right-4">
              <div className="bg-black bg-opacity-50 rounded-lg px-3 py-1.5 flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
                <span className="text-white text-sm font-medium">{formatTime(recordingTime)}</span>
              </div>
            </div>
          )}

          {/* Recording Control */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white rounded-full p-3 flex items-center justify-center shadow-lg transition-colors duration-200`}
            >
              {isRecording ? (
                <StopCircle className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Chat/Logs Section */}
        <div className="flex-1 bg-gray-100 flex flex-col">
          <div className="p-4 font-medium text-gray-700 bg-gray-200 flex justify-between items-center">
            <span>Logs/Chat</span>
            <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
              Submit Interview
            </button>
          </div>
          <div ref={logsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-50 text-blue-700'
                    : message.type === 'assistant'
                    ? 'bg-gray-50 text-gray-700'
                    : 'bg-amber-50 text-amber-700 text-sm'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-700">
            <div className="flex items-center">
              <textarea
                placeholder="Type here..."
                className="flex-1 px-4 py-2 rounded bg-gray-600 text-white placeholder-gray-400 focus:outline-none resize-none"
                rows={2}
                style={{ minHeight: '60px', wordWrap: 'break-word' }}
              />
              <button className="ml-2 px-4 py-2 h-full bg-gray-600 rounded">
                <span className="transform rotate-90 inline-block text-white">➤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChatWithExecution;