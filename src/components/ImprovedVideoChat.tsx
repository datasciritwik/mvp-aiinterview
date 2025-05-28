import React, { useState, useRef, useEffect } from 'react';
import { Video, StopCircle, MessageSquare, Clock, Code2, Terminal, CheckCircle, XCircle } from 'lucide-react';
import ExecutableEditor from './EnhancedCodeEditor';
import { languageOptions } from '../utils/language';

interface ExecutionOutput {
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  result?: string;
}

interface Message {
  type: 'user' | 'assistant' | 'system';
  text: string;
}

const VideoChatWithExecution: React.FC = () => {
  // Video chat state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [streamError, setStreamError] = useState<string | null>(null);
  
  // Code execution state
  const [code, setCode] = useState(languageOptions[1].default);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[1].value);
  const [output, setOutput] = useState<ExecutionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Message log
  const [messages, setMessages] = useState<Message[]>([
    { type: 'system', text: 'Session started' },
    { type: 'user', text: 'Ready to start your interview recording?' },
    { type: 'assistant', text: 'Click "Start Recording" to begin recording your webcam.' }
  ]);
  
  // Refs
  const webcamRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  
  // Clean up function when component unmounts
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Timer effect for recording
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

  // Helper function to handle MediaRecorder setup
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
  
  // Start recording
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
      addMessage('system', 'Recording started with webcam');

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
  
  const handleExecutionComplete = (result: ExecutionOutput | null, errorMsg: string | null) => {
    if (result) {
      setOutput(result);
      setError(null);
      
      const hasOutput = result.stdout || (result.result && typeof result.result === 'string');
      addMessage('assistant', hasOutput ? 'Your code ran successfully!' : 'Your code executed with no output.');
    } else if (errorMsg) {
      setOutput(null);
      setError(errorMsg);
      addMessage('assistant', 'There was an error running your code.');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Code2 className="w-8 h-8 mr-3 text-amber-600" />
            Interactive Coding Interview
          </h1>
          <p className="text-gray-600 mt-2">
            Record your coding session while solving problems in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Terminal className="w-5 h-5 text-amber-400 mr-2" />
                  <h2 className="text-lg font-semibold text-white">Code Editor</h2>
                </div>
              </div>
              <div className="h-[400px]">
                <ExecutableEditor
                  initialLanguage={selectedLanguage}
                  initialCode={code}
                  onChange={setCode}
                  onLanguageChange={setSelectedLanguage}
                  onExecuteComplete={handleExecutionComplete}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                <Terminal className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Output</h2>
              </div>
              <div className="p-6 h-[200px] overflow-auto">
                {error || output ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      {error ? (
                        <XCircle className="w-6 h-6 text-red-500 mr-2" />
                      ) : (
                        <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                      )}
                      <h3 className="text-lg font-semibold">
                        {error ? 'Error' : 'Success'}
                      </h3>
                    </div>
                    
                    {error ? (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-700 font-mono text-sm">
                        {error}
                      </div>
                    ) : output && (
                      <div className="space-y-4">
                        {output.stdout && (
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Standard Output:</div>
                            <pre className="font-mono text-sm text-gray-600 whitespace-pre-wrap">{output.stdout}</pre>
                          </div>
                        )}
                        {output.result && !output.stdout && (
                          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Result:</div>
                            <pre className="font-mono text-sm text-gray-600 whitespace-pre-wrap">{output.result}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Run your code to see the output here
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <div className="aspect-video bg-gray-900">
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
                        <div className="text-center px-6">
                          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                          <p className="text-red-400 text-sm">{streamError}</p>
                        </div>
                      ) : (
                        <Video className="w-16 h-16 text-gray-400 opacity-50" />
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex items-center space-x-3">
                  {isRecording && (
                    <div className="bg-black bg-opacity-50 rounded-lg px-3 py-1.5 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
                      <span className="text-white text-sm font-medium">{formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 flex items-center justify-center shadow-lg transition-colors duration-200"
                    >
                      <StopCircle className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-3 flex items-center justify-center shadow-lg transition-colors duration-200"
                    >
                      <Video className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                <MessageSquare className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Session Log</h2>
              </div>
              <div className="p-4 h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-50 text-blue-700 ml-4'
                          : message.type === 'assistant'
                          ? 'bg-gray-50 text-gray-700 mr-4'
                          : 'bg-amber-50 text-amber-700 text-sm'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChatWithExecution;