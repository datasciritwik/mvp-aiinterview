import React, { useState, useRef, useEffect } from 'react';
import { Video, StopCircle, MessageSquare } from 'lucide-react';

interface Message {
  type: 'user' | 'assistant' | 'system';
  text: string;
}

const VideoChatWithExecution: React.FC = () => {
  // Video chat state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [streamError, setStreamError] = useState<string | null>(null);
  
  // Message log
  const [messages, setMessages] = useState<Message[]>([
    { type: 'system', text: 'Session started' },
    { type: 'user', text: 'Ready to start your interview recording?' },
    { type: 'assistant', text: 'Click the record button to begin.' }
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Video Preview and Controls */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                      <p className="text-red-400 text-sm">{streamError}</p>
                    </div>
                  ) : (
                    <Video className="w-16 h-16 text-gray-400 opacity-50" />
                  )}
                </div>
              )}
            </div>

            {/* Recording Timer */}
            {isRecording && (
              <div className="absolute top-4 right-4">
                <div className="bg-black bg-opacity-50 rounded-lg px-3 py-1.5 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
                  <span className="text-white text-sm font-medium">{formatTime(recordingTime)}</span>
                </div>
              </div>
            )}

            {/* Recording Controls */}
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
        </div>

        {/* Session Log */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center">
            <MessageSquare className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="font-medium text-gray-700">Session Log</h2>
          </div>
          <div className="p-4 h-[300px] overflow-y-auto">
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
  );
};

export default VideoChatWithExecution;