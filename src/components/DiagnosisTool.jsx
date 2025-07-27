import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { SystemDataContext } from '../context/SystemDataContext';
import { diagnoseIssue, diagnoseSystemLogs, trainLogsAgent, extractTextFromImage, extractTextFromBase64, getOcrStatus } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileSearch,
  MessageSquare,
  User,
  Cpu,
  Loader,
  ChevronRight,
  Zap,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  X,
  Image,
  Link,
  Camera,
  Upload,
  AlertTriangle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { LifeBuoy } from 'lucide-react';

const DiagnosisTool = () => {
  const { systemData } = useContext(SystemDataContext);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackIndex, setFeedbackIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [ocrStatus, setOcrStatus] = useState(null);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Check if a query is related to system logs
  const isLogRelatedQuery = (query) => {
    const logKeywords = [
      'log', 'error log', 'system log', 'event log', 'warning', 
      'critical error', 'system error', 'event viewer', 'crash log'
    ];
    
    const lowerQuery = query.toLowerCase();
    return logKeywords.some(keyword => lowerQuery.includes(keyword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', content: userInput };
    setConversation([...conversation, userMessage]);
    setIsLoading(true);
    
    try {
      // Check if the query is related to system logs
      if (isLogRelatedQuery(userInput)) {
        // Use system logs diagnosis
        const response = await diagnoseSystemLogs(userInput);
        // Show related logs if available
        let content = response.diagnosis;
        if (response.relatedLogs && response.relatedLogs.length > 0) {
          content += '\n\n### Related Logs:\n';
          response.relatedLogs.forEach(log => {
            const timestamp = new Date(log.timestamp).toLocaleString();
            content += `- **[${log.level.toUpperCase()}]** (${timestamp}) ${log.source}: ${log.message}\n`;
          });
        }
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content,
          originalQuery: userInput,
          isLogAnalysis: true 
        }]);
      } else {
        // Use regular diagnosis
        const response = await diagnoseIssue(userInput, systemData);
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: response.diagnosis,
          originalQuery: userInput,
          isLogAnalysis: false 
        }]);
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
      setConversation([
        ...conversation, 
        userMessage, 
        { role: 'assistant', content: 'Sorry, I encountered an error while diagnosing your issue. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  // Open file selection dialog for image upload
  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Process the selected image file
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected or file selection canceled');
      return;
    }
    
    console.log('File selected for upload:', file.name, 'type:', file.type, 'size:', file.size);
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, etc.)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('The image file is too large. Please select an image under 10MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setIsProcessingImage(true);
    setShowImageOptions(false);
    
    try {
      // Display a loading message in the user input field
      setUserInput('Processing uploaded image...');
      
      // Extract text from the image
      const result = await extractTextFromImage(file);
      
      if (result && result.success && result.text) {
        // Check if OCR is simulated or real
        if (result.simulated) {
          console.log('OCR is running in simulation mode');
          setConversation(prev => [...prev, { 
            role: 'system', 
            content: '',
            isSystemMessage: true
          }]);
        }
        
        // Show success notification
        console.log('OCR ' + (result.simulated ? 'simulation' : 'extraction') + ' successful for uploaded image, text length:', result.text.length);
        
        // Create a blob URL for displaying the image
        const imageUrl = URL.createObjectURL(file);
        
        // Use the extracted text as input
        const extractedText = result.text;
        setUserInput(extractedText);
        
        // Directly handle the submission of the extracted text with the image
        if (extractedText.trim()) {
          // Create a user message that includes both the image and extracted text
          const userMessage = { 
            role: 'user', 
            content: extractedText,
            imageData: imageUrl,
            imageName: file.name
          };
          
          // Add the message to conversation
          setConversation(prev => [...prev, userMessage]);
          setIsLoading(true);
          
          try {
            // Process the extracted text
            if (isLogRelatedQuery(extractedText)) {
              // Use system logs diagnosis
              const response = await diagnoseSystemLogs(extractedText);
              
              // Show related logs if available
              let content = response.diagnosis;
              if (response.relatedLogs && response.relatedLogs.length > 0) {
                content += '\n\n### Related Logs:\n';
                response.relatedLogs.forEach(log => {
                  const timestamp = new Date(log.timestamp).toLocaleString();
                  content += `- **[${log.level.toUpperCase()}]** (${timestamp}) ${log.source}: ${log.message}\n`;
                });
              }
              
              setConversation(prev => [...prev, { 
                role: 'assistant', 
                content,
                originalQuery: extractedText,
                isLogAnalysis: true 
              }]);
            } else {
              // Use regular diagnosis
              const response = await diagnoseIssue(extractedText, systemData);
              
              setConversation(prev => [...prev, { 
                role: 'assistant', 
                content: response.diagnosis,
                originalQuery: extractedText,
                isLogAnalysis: false 
              }]);
            }
          } catch (error) {
            console.error('Diagnosis error:', error);
            setConversation(prev => [...prev, { 
              role: 'assistant', 
              content: 'Sorry, I encountered an error while diagnosing your issue. Please try again.' 
            }]);
          } finally {
            setIsLoading(false);
            setUserInput('');
          }
        }
      } else {
        setUserInput('');
        console.error('OCR returned empty or invalid result for uploaded image:', result);
        alert('No text could be extracted from the image. Try a clearer image or type your question manually.');
      }
    } catch (error) {
      console.error('Image upload processing error:', error);
      setUserInput('');
      alert(`Error processing image: ${error.message || 'Unknown error'}. Please try again or type your question manually.`);
    } finally {
      setIsProcessingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle pasting image from clipboard - memoize with useCallback
  const handlePaste = useCallback(async (event) => {
    // Only proceed if not already processing an image or loading
    if (isProcessingImage || isLoading) {
      console.log('Ignoring paste event - already processing image or loading');
      return;
    }

    const items = event.clipboardData?.items;
    if (!items) {
      console.log('No clipboardData items found in paste event');
      return;
    }

    console.log('Paste event detected with', items.length, 'items');
    
    // Look for image items in the clipboard
    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log('Clipboard item type:', item.type, item.kind);
      
      if (item.type.indexOf('image') !== -1) {
        hasImage = true;
        event.preventDefault();
        
        console.log('Image found in clipboard data:', item.type);
        
        const file = item.getAsFile();
        if (!file) {
          console.error('Failed to get file from clipboard item');
          continue;
        }
        
        console.log('Clipboard image details:', file.name || 'unnamed', file.type, file.size, 'bytes');
        
        setIsProcessingImage(true);
        
        try {
          // Display a loading message in the user input field
          setUserInput('Processing clipboard image...');
          
          // Convert image to base64
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64Data = e.target.result;
            console.log('Image read successfully, size:', base64Data.length);
            
            try {
              // Extract text from the base64 image
              const result = await extractTextFromBase64(base64Data);
              
              if (result && result.success && result.text) {
                // Check if OCR is simulated or real
                if (result.simulated) {
                  console.log('OCR is running in simulation mode');
                  setConversation(prev => [...prev, { 
                    role: 'system', 
                    content: '',
                    isSystemMessage: true
                  }]);
                }
                
                // Show success notification
                console.log('OCR ' + (result.simulated ? 'simulation' : 'extraction') + ' successful, text length:', result.text.length);
                
                // Use the extracted text as input
                const extractedText = result.text;
                setUserInput(extractedText);
                
                // Directly handle the submission of the extracted text with the image
                if (extractedText.trim()) {
                  // Create a user message that includes both the image and extracted text
                  const userMessage = { 
                    role: 'user', 
                    content: extractedText,
                    imageData: base64Data,
                    imageName: 'Clipboard image'
                  };
                  
                  // Add the message to conversation (this is what handleSubmit would do)
                  setConversation(prev => [...prev, userMessage]);
                  setIsLoading(true);
                  
                  try {
                    // Process the extracted text
                    if (isLogRelatedQuery(extractedText)) {
                      // Use system logs diagnosis
                      const response = await diagnoseSystemLogs(extractedText);
                      
                      // Show related logs if available
                      let content = response.diagnosis;
                      if (response.relatedLogs && response.relatedLogs.length > 0) {
                        content += '\n\n### Related Logs:\n';
                        response.relatedLogs.forEach(log => {
                          const timestamp = new Date(log.timestamp).toLocaleString();
                          content += `- **[${log.level.toUpperCase()}]** (${timestamp}) ${log.source}: ${log.message}\n`;
                        });
                      }
                      
                      setConversation(prev => [...prev, { 
                        role: 'assistant', 
                        content,
                        originalQuery: extractedText,
                        isLogAnalysis: true 
                      }]);
                    } else {
                      // Use regular diagnosis
                      const response = await diagnoseIssue(extractedText, systemData);
                      
                      setConversation(prev => [...prev, { 
                        role: 'assistant', 
                        content: response.diagnosis,
                        originalQuery: extractedText,
                        isLogAnalysis: false 
                      }]);
                    }
                  } catch (error) {
                    console.error('Diagnosis error:', error);
                    setConversation(prev => [...prev, { 
                      role: 'assistant', 
                      content: 'Sorry, I encountered an error while diagnosing your issue. Please try again.' 
                    }]);
                  } finally {
                    setIsLoading(false);
                    setUserInput('');
                  }
                }
              } else {
                setUserInput('');
                console.error('OCR returned empty or invalid result:', result);
                alert('Could not extract text from the pasted image. The OCR service returned an invalid result.');
              }
            } catch (error) {
              console.error('Base64 image processing error:', error);
              setUserInput('');
              alert(`Error processing image: ${error.message || 'Unknown error'}. Try uploading the image directly instead.`);
            } finally {
              setIsProcessingImage(false);
            }
          };
          
          reader.onerror = (error) => {
            console.error('Error reading file:', error);
            setIsProcessingImage(false);
            setUserInput('');
            alert('Failed to read the image from clipboard. Try uploading the image directly.');
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Clipboard paste error:', error);
          setIsProcessingImage(false);
          setUserInput('');
          alert(`Failed to process clipboard content: ${error.message || 'Unknown error'}`);
        }
        
        break;
      }
    }
    
    // If no image was found, let the default paste behavior occur
    if (!hasImage) {
      console.log('No image found in clipboard data, allowing default paste behavior');
    }
  }, [isProcessingImage, isLoading, setUserInput, setConversation, setIsProcessingImage, extractTextFromBase64, diagnoseIssue, diagnoseSystemLogs, isLogRelatedQuery, systemData]);

  // Add event listener for paste events
  useEffect(() => {
    // Add the paste event listener directly to the document
    document.addEventListener('paste', handlePaste);
    
    console.log('Paste event listener added to document');
    
    // Clean up
    return () => {
      document.removeEventListener('paste', handlePaste);
      console.log('Paste event listener removed from document');
    };
  }, [handlePaste]); // Only depend on the memoized handlePaste function

  // Focus the input field when the component mounts
  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, []);
  
  // Focus the input field when image options are closed
  useEffect(() => {
    if (!showImageOptions && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current.focus();
      }, 100);
    }
  }, [showImageOptions]);

  // Toggle the image options panel
  const toggleImageOptions = () => {
    setShowImageOptions(!showImageOptions);
  };

  // Handle feedback submission for logs agent training
  const handleFeedback = async (messageIndex, wasHelpful) => {
    const message = conversation[messageIndex];
    
    // Only collect feedback for log analysis responses
    if (!message || message.role !== 'assistant' || !message.isLogAnalysis) {
      return;
    }
    
    try {
      if (wasHelpful) {
        // Simple positive feedback
        await trainLogsAgent(
          message.originalQuery, 
          message.content, 
          true
        );
        // Show success message temporarily
        const updatedConversation = [...conversation];
        updatedConversation[messageIndex] = {
          ...message,
          feedbackGiven: 'positive'
        };
        setConversation(updatedConversation);
      } else {
        // For negative feedback, show a form to collect more information
        setFeedbackIndex(messageIndex);
        setShowFeedbackForm(true);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  // Submit detailed feedback
  const submitDetailedFeedback = async () => {
    if (feedbackIndex === null) return;
    
    const message = conversation[feedbackIndex];
    
    try {
      await trainLogsAgent(
        message.originalQuery,
        message.content,
        false,
        feedbackText
      );
      
      // Update conversation to show feedback was given
      const updatedConversation = [...conversation];
      updatedConversation[feedbackIndex] = {
        ...message,
        feedbackGiven: 'negative'
      };
      setConversation(updatedConversation);
      
      // Reset feedback state
      setFeedbackIndex(null);
      setFeedbackText('');
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
    }
  };

  // Cancel feedback submission
  const cancelFeedback = () => {
    setFeedbackIndex(null);
    setFeedbackText('');
    setShowFeedbackForm(false);
  };

  // Effect to check OCR status on component mount
  useEffect(() => {
    const checkOcrStatus = async () => {
      try {
        const status = await getOcrStatus();
        setOcrStatus(status);
        console.log('OCR status check complete:', status);
      } catch (error) {
        console.error('Failed to check OCR status:', error);
      }
    };
    
    checkOcrStatus();
  }, []);

  // Text-to-speech function
  const handleTextToSpeech = (messageIndex) => {
    const message = conversation[messageIndex];
    if (!message || message.role !== 'assistant') return;
    
    // If already speaking, stop it
    if (speakingMessageIndex === messageIndex) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageIndex(null);
      return;
    }
    
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Extract plain text from markdown
    let textToSpeak = message.content;
    // Remove markdown formatting for better speech
    textToSpeak = textToSpeak
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/#{1,6}\s+/g, '')      // Headers
      .replace(/```[\s\S]*?```/g, 'Code block omitted') // Code blocks
      .replace(/`(.*?)`/g, '$1')      // Inline code
      .replace(/\n- /g, '. ')         // List items
      .replace(/\n\d+\. /g, '. ');    // Numbered list items
    
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      // Try to find a good English voice
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en') && (voice.name.includes('David') || voice.name.includes('Mark') || voice.name.includes('James'))
      );
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      // Set the speaking message index
      setSpeakingMessageIndex(messageIndex);
      
      // Handle when speech is done
      utterance.onend = () => {
        setSpeakingMessageIndex(null);
      };
      
      // Handle errors
      utterance.onerror = () => {
        setSpeakingMessageIndex(null);
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      speechSynthesisRef.current = utterance;
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };
  
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="py-4">
      <div className="flex items-center mb-4">
        <FileSearch className="h-5 w-5 mr-2 text-[#4a6fa5]" />
        <h2 className="text-xl font-bold text-white">OS Assistant</h2>
      </div>
      
      {/* OCR Status Warning Banner */}
      {ocrStatus && !ocrStatus.tesseractAvailable && (
        <div className="">
        </div>
      )}
      
      <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {conversation.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <MessageSquare className="h-12 w-12 mx-auto text-[#4a6fa5] opacity-70" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Hello! I'm your OS Assistant</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Ask me any OS-related questions or describe issues you're experiencing, and I'll provide detailed diagnoses and solutions.
            </p>
            <div className="max-w-md mx-auto text-left bg-[#111217] p-4 rounded-md border border-gray-800">
              <p className="font-medium mb-2 text-[#4a6fa5] text-sm">Examples:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#4a6fa5]/20 text-[#4a6fa5] mr-2">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  "My computer is running slow"
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#4a6fa5]/20 text-[#4a6fa5] mr-2">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  "What does this error in my system logs mean?"
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#4a6fa5]/20 text-[#4a6fa5] mr-2">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  "Show me critical issues in my event logs"
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#4a6fa5]/20 text-[#4a6fa5] mr-2">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  "How can I speed up my Windows startup?"
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  message.role === 'user'
                    ? 'bg-[#111217] ml-8 border-l-2 border-[#4a6fa5]'
                    : 'bg-[#202226] mr-8 border-l-2 border-[#4cb5ab]'
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'mr-3' : 'mr-3'}`}>
                    {message.role === 'user' ? (
                      <div className="h-8 w-8 rounded-full bg-[#4a6fa5]/20 flex items-center justify-center">
                        {message.imageData || message.imageName ? (
                          <Image className="h-4 w-4 text-[#4a6fa5]" />
                        ) : (
                          <User className="h-4 w-4 text-[#4a6fa5]" />
                        )}
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#4cb5ab]/20 flex items-center justify-center">
                        <Cpu className="h-4 w-4 text-[#4cb5ab]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className={`text-xs mb-1 ${message.role === 'user' ? 'text-[#4a6fa5]' : 'text-[#4cb5ab]'}`}>
                        {message.role === 'user' ? 'You' : 'OS Assistant'}
                      </p>
                      
                      <div className="flex space-x-2">
                        {/* Text-to-speech button for assistant messages */}
                        {message.role === 'assistant' && (
                          <button 
                            onClick={() => handleTextToSpeech(index)}
                            className="p-1 hover:bg-[#111217] rounded-full" 
                            title={speakingMessageIndex === index ? "Stop speaking" : "Listen to this response"}
                          >
                            {speakingMessageIndex === index ? (
                              <VolumeX className="h-4 w-4 text-green-500" />
                            ) : (
                              <Volume2 className="h-4 w-4 text-gray-500 hover:text-green-500" />
                            )}
                          </button>
                        )}
                        
                        {/* Feedback buttons for log analysis responses */}
                        {message.role === 'assistant' && message.isLogAnalysis && !message.feedbackGiven && (
                          <>
                            <button 
                              onClick={() => handleFeedback(index, true)}
                              className="p-1 hover:bg-[#111217] rounded-full" 
                              title="This was helpful"
                            >
                              <ThumbsUp className="h-4 w-4 text-gray-500 hover:text-green-500" />
                            </button>
                            <button 
                              onClick={() => handleFeedback(index, false)}
                              className="p-1 hover:bg-[#111217] rounded-full" 
                              title="This could be improved"
                            >
                              <ThumbsDown className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* Feedback confirmation */}
                      {message.role === 'assistant' && message.feedbackGiven && (
                        <div className="text-xs">
                          {message.feedbackGiven === 'positive' ? (
                            <span className="text-green-500 flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" /> Thanks for your feedback
                            </span>
                          ) : (
                            <span className="text-blue-400 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" /> Feedback submitted
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {/* Display uploaded image if exists */}
                      {message.role === 'user' && message.imageData && (
                        <div className="mb-3">
                          <div className="relative max-w-xs">
                            <img 
                              src={message.imageData} 
                              alt="Uploaded" 
                              className="rounded-md border border-gray-700 max-h-64 object-contain" 
                            />
                            <span className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                              {message.imageName}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {message.role === 'user' ? (
                        <div className="whitespace-pre-line">{message.content}</div>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-invert break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content.endsWith('"') || message.content.endsWith(':') || message.content.endsWith('*') ? 
                              message.content + '...\n\n*Content continues but has been truncated. Please try a more specific query for complete information.*' : 
                              message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-pulse flex justify-center items-center">
              <div className="h-2 w-2 bg-[#4cb5ab] rounded-full mr-1"></div>
              <div className="h-2 w-2 bg-[#4cb5ab] rounded-full mr-1 animation-delay-200"></div>
              <div className="h-2 w-2 bg-[#4cb5ab] rounded-full animation-delay-400"></div>
            </div>
            <p className="text-[#4cb5ab] mt-2 text-sm">Analyzing causes and preparing detailed solution...</p>
          </div>
        )}
      </div>

      {/* Image upload options panel */}
      {showImageOptions && (
        <div className="bg-[#1e2227] rounded-md border border-gray-800 p-4 mb-4">
          <h3 className="text-base font-medium text-white mb-3">Extract text from image</h3>
          <div className="p-3 border border-gray-700 rounded-md bg-[#202226]">
            <h4 className="font-medium mb-2 flex items-center text-sm text-gray-300">
              <Upload className="h-4 w-4 mr-2 text-[#4a6fa5]" />
              Upload image
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Upload an image file containing text you want to analyze
            </p>
            <button
              onClick={handleOpenFileDialog}
              className="px-3 py-2 bg-[#4a6fa5] text-white rounded text-sm w-full flex items-center justify-center"
              disabled={isProcessingImage}
            >
              {isProcessingImage ? (
                <>
                  <Loader className="animate-spin h-3 w-3 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="h-3 w-3 mr-2" />
                  Select Image
                </>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">
              <strong>Pro tip:</strong> You can also paste images directly into the input field (Ctrl+V)
            </p>
          </div>
          <div className="mt-3 text-right">
            <button
              onClick={() => setShowImageOptions(false)}
              className="text-gray-400 hover:text-gray-200 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1e2227] rounded-md border border-gray-800 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a question or paste an image (Ctrl+V)..."
              disabled={isLoading || isProcessingImage}
              className="w-full px-3 py-2 border border-gray-700 bg-[#111217] text-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4a6fa5] focus:border-transparent text-sm"
              ref={textInputRef}
              onPaste={handlePaste}
              onFocus={() => console.log('Input field focused')}
              onBlur={() => console.log('Input field blurred')}
            />
            <div 
              className="absolute right-10 top-2.5 text-xs text-gray-500"
              style={{ pointerEvents: 'none' }}
            >
              Ctrl+V to paste image
            </div>
            <button
              type="button"
              onClick={toggleImageOptions}
              className="absolute right-2 top-2 p-1 rounded-md hover:bg-[#202226]"
              title="Upload image with text"
              disabled={isLoading || isProcessingImage}
            >
              <Image className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || isProcessingImage || !userInput.trim()}
            className="px-4 py-2 bg-[#4a6fa5] text-white rounded text-sm hover:bg-[#5f83b9] transition-colors flex items-center disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading || isProcessingImage ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                {isProcessingImage ? 'Processing...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Get Help
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiagnosisTool; 