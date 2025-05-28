import React, { useState, useRef, useEffect } from 'react';
import { Video, StopCircle, Mic, CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(false);
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
    { type: 'assistant', text: 'Click "Start Recording" to begin recording your webcam and system audio.' }
  ]);
  
  // Refs
  const webcamRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const systemAudioStreamRef = useRef<MediaStream | null>(null);
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
  const setupMediaRecorder = (combinedStream: MediaStream) => {
    try {
      // Initialize media recorder with MIME options for better compatibility
      const options = { mimeType: getSupportedMimeType() };
      const mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      // Collect recorded chunks
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
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

      // Start media recorder
      mediaRecorder.start(1000); // Collect data every second
    } catch (err) {
      console.error("Error setting up MediaRecorder:", err);
      throw err;
    }
  };
  
  // Start recording webcam and system audio
  const startRecording = async () => {
    try {
      setStreamError(null);
      
      // First get system audio using getDisplayMedia
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: false, // We don't need the video
        audio: true // We only want system audio
      });
      
      // Store system audio stream reference
      systemAudioStreamRef.current = displayStream;
      
      // Now get webcam and mic
      const webcamStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true // This gets microphone audio
      });
      
      // Store webcam stream reference
      webcamStreamRef.current = webcamStream;
      
      // Set up display for webcam preview
      if (webcamRef.current) {
        webcamRef.current.srcObject = webcamStream;
        webcamRef.current.muted = true;
      }
      
      // Combine all audio tracks and video track
      const audioTracks = [
        ...displayStream.getAudioTracks(), // System audio
        ...webcamStream.getAudioTracks()   // Microphone audio
      ];
      const videoTrack = webcamStream.getVideoTracks()[0]; // Webcam video
      
      // Create a new MediaStream with all tracks
      const combinedStream = new MediaStream([
        videoTrack,
        ...audioTracks
      ]);
      
      // Setup and start media recorder with combined stream
      setupMediaRecorder(combinedStream);
      
      // Update recording state
      setIsRecording(true);
      
      // Add message to log
      addMessage('system', 'Recording started with webcam and system audio');
      
    } catch (err) {
      // Cleanup any streams that might have been created
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
      if (systemAudioStreamRef.current) {
        systemAudioStreamRef.current.getTracks().forEach(track => track.stop());
        systemAudioStreamRef.current = null;
      }
      
      console.error("Error starting recording:", err);
      setStreamError(err instanceof Error ? err.message : "Failed to start recording");
      addMessage('system', `Recording error: ${err instanceof Error ? err.message : "Failed to start recording"}`);
    }
  };
  
  // Helper to get supported MIME type
  const getSupportedMimeType = () => {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      return 'video/webm;codecs=vp9,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      return 'video/webm;codecs=vp8,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      return 'video/webm';
    } else {
      return ''; // Default to browser's choice
    }
  };
  
  // Toggle mute functionality
  const toggleMute = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    if (systemAudioStreamRef.current) {
      systemAudioStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    
    setIsMuted(!isMuted);
  };
  
  // Save the recording locally
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
      
      // Clean up the local URL
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error saving recording locally:', err);
      addMessage('system', `Error saving locally: ${err instanceof Error ? err.message : "Unknown error occurred"}`);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    
    if (systemAudioStreamRef.current) {
      systemAudioStreamRef.current.getTracks().forEach(track => track.stop());
      systemAudioStreamRef.current = null;
    }
    
    if (webcamRef.current) {
      webcamRef.current.srcObject = null;
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    setIsMuted(false);
    
    // Add message to log
    addMessage('system', 'Recording stopped');
  };
  
  // Handle code execution results
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
  
  // Add message to the log
  const addMessage = (type: 'user' | 'assistant' | 'system', text: string) => {
    setMessages(prev => [...prev, { type, text }]);
  };
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex h-screen bg-amber-50 text-gray-800">
      <div className="flex w-full p-4">
        {/* Left side - Code Editor and Output */}
        <div className="flex flex-col w-3/5 pr-4 h-full">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col rounded-lg overflow-hidden shadow-md mb-4">
            <div className="bg-amber-100 px-4 py-3 font-semibold border-b border-amber-200">
              Code Editor
            </div>
            <div className="flex-1 bg-gray-900 text-amber-50 font-mono text-sm overflow-hidden">
              <ExecutableEditor
                initialLanguage={selectedLanguage}
                initialCode={code}
                onChange={setCode}
                onLanguageChange={setSelectedLanguage}
                onExecuteComplete={handleExecutionComplete}
              />
            </div>
          </div>
          
          {/* Output section */}
          <div className="bg-amber-100 rounded-lg shadow-md h-48 overflow-hidden flex flex-col">
            <div className="px-4 py-3 font-semibold border-b border-amber-200">
              Output
            </div>
            <div className="bg-white p-4 font-mono text-sm flex-1 overflow-auto">
              {error || output ? (
                <div className="bg-white rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    {error ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <h2 className="text-lg font-semibold">
                      {error ? 'Error' : 'Output'}
                    </h2>
                  </div>
                  
                  {error ? (
                    <div className="text-red-500 whitespace-pre-wrap">{error}</div>
                  ) : output && (
                    <div className="space-y-2">
                      {output.stdout && (
                        <div className="bg-gray-100 p-3 rounded">
                          <h3 className="font-semibold mb-1">Standard Output:</h3>
                          <pre className="whitespace-pre-wrap">{output.stdout}</pre>
                        </div>
                      )}
                      
                      {output.stderr && (
                        <div className="bg-gray-100 p-3 rounded">
                          <h3 className="font-semibold mb-1">Standard Error:</h3>
                          <pre className="whitespace-pre-wrap">{output.stderr}</pre>
                        </div>
                      )}
                      
                      {output.result && typeof output.result === 'string' && !output.stdout && (
                        <div className="bg-gray-100 p-3 rounded">
                          <h3 className="font-semibold mb-1">Result:</h3>
                          <pre className="whitespace-pre-wrap">{output.result}</pre>
                        </div>
                      )}
                      
                      {output.exit_code !== undefined && (
                        <div className="text-sm text-gray-500">
                          Exit Code: {output.exit_code}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 flex items-center justify-center h-full">
                  Click "Run Code" to see output here
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right side - Display and Controls */}
        <div className="w-2/5 pl-4 flex flex-col h-full">
          {/* Webcam preview */}
          <div className="bg-amber-100 rounded-lg shadow-md overflow-hidden mb-4">
            <div className="px-4 py-2 font-semibold border-b border-amber-200">
              Webcam Preview
            </div>
            <div className="h-48 bg-gray-900 relative overflow-hidden">
              <video 
                ref={webcamRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={true}
              />
              
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70">
                  {streamError ? (
                    <div className="text-red-400 text-center px-4">
                      <div className="text-lg mb-1">Recording Error</div>
                      <div className="text-xs">{streamError}</div>
                    </div>
                  ) : (
                    <Video className="text-amber-200 opacity-50" size={48} />
                  )}
                </div>
              )}
              
              {isRecording && (
                <div className="absolute top-2 right-2 flex items-center">
                  <div className="flex items-center mr-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                    <span className="text-white text-xs">REC</span>
                  </div>
                  <button 
                    onClick={toggleMute}
                    className={`p-1 rounded-full ${isMuted ? 'bg-red-500' : 'bg-amber-200'}`}
                  >
                    <Mic size={12} className={isMuted ? 'text-white' : 'text-gray-800'} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Recording Controls */}
          <div className="bg-amber-100 rounded-lg shadow-md p-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                {isRecording ? (
                  <button 
                    className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium flex items-center gap-2"
                    onClick={stopRecording}
                  >
                    <StopCircle size={18} />
                    Stop Recording
                  </button>
                ) : (
                  <button 
                    className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium flex items-center gap-2"
                    onClick={startRecording}
                  >
                    <Video size={18} />
                    Start Recording
                  </button>
                )}
                
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg shadow-sm">
                  <Clock size={18} className="text-amber-700" />
                  <span className="font-mono text-amber-800">{formatTime(recordingTime)}</span>
                </div>
              </div>
              
              {isRecording && (
                <div className="text-xs bg-amber-50 text-amber-800 p-2 rounded flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Recording in progress. Your webcam and system audio are being captured.
                </div>
              )}
            </div>
          </div>
          
          {/* Conversation Logs */}
          <div className="flex-1 bg-amber-100 rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="px-4 py-3 font-semibold border-b border-amber-200 flex items-center">
              <MessageSquare className="mr-2" size={16} />
              Conversation Logs
            </div>
            
            <div className="flex-1 bg-white p-3 overflow-y-auto">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-2 p-2 rounded ${
                    message.type === 'user' 
                      ? 'bg-amber-200 text-gray-800 ml-4' 
                      : message.type === 'assistant'
                        ? 'bg-gray-100 text-gray-800 mr-4'
                        : 'bg-amber-50 text-gray-500 text-xs'
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