"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  Volume2, 
  Download, 
  Play, 
  Pause, 
  Stop, 
  Settings, 
  Activity,
  Clock,
  Languages,
  FileAudio,
  MessageSquare,
  Zap
} from "lucide-react";

interface VoiceStatus {
  status: string;
  timestamp: string;
  stats: {
    cpu_usage: number;
    memory_usage: number;
    active_connections: number;
    tts_requests: number;
    stt_requests: number;
  };
  audio_config: {
    volume: number;
    speed: number;
    format: string;
  };
  is_playing: boolean;
  queue_size: number;
}

interface Voice {
  id: string;
  name: string;
  languages: string[];
  gender: string;
  age: number;
}

interface VoiceRequest {
  timestamp: string;
  type: string;
  language: string;
  text_length?: number;
  processing_time_ms: number;
}

export default function VoicePage() {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [logs, setLogs] = useState<VoiceRequest[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // TTS State
  const [ttsText, setTtsText] = useState("");
  const [ttsLanguage, setTtsLanguage] = useState("bn");
  const [ttsVoice, setTtsVoice] = useState("default");
  const [ttsStream, setTtsStream] = useState(true);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  
  // STT State
  const [sttLanguage, setSttLanguage] = useState("bn");
  const [sttResult, setSttResult] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // Voice Chat State
  const [chatText, setChatText] = useState("");
  const [chatLanguage, setChatLanguage] = useState("bn");
  const [chatHistory, setChatHistory] = useState<Array<{text: string, response: string, timestamp: string}>>([]);
  
  // Audio player refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8001');
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('Connected to voice server');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'tts_complete') {
        console.log('TTS completed:', data);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from voice server');
    };
    
    return () => ws.close();
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchVoiceStatus();
    fetchVoices();
    fetchLogs();
    
    const interval = setInterval(() => {
      fetchVoiceStatus();
      fetchLogs();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchVoiceStatus = async () => {
    try {
      const response = await fetch('/api/voice-status');
      const data = await response.json();
      if (data.success) {
        setVoiceStatus(data.status);
        setIsConnected(data.server_online);
      } else {
        setVoiceStatus(data.status);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to fetch voice status:', error);
      setIsConnected(false);
    }
  };

  const fetchVoices = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/voices');
      const data = await response.json();
      if (data.success) {
        setVoices(data.voices);
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/logs');
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleTTS = async () => {
    if (!ttsText.trim()) {
      setError("Please enter text to convert to speech");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ttsText,
          language: ttsLanguage,
          voice: ttsVoice,
          stream: ttsStream
        }),
      });

      const data = await response.json();

      if (ttsStream) {
        // Streaming mode
        if (data.success) {
          setError(null);
          console.log('Audio queued for playback:', data);
        } else {
          setError(data.error || 'TTS failed');
        }
      } else {
        // Download mode
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setTtsAudioUrl(url);
          setError(null);
        } else {
          setError(data.error || 'TTS failed');
        }
      }
    } catch (error) {
      setError('Failed to process TTS request');
      console.error('TTS error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSTT = async () => {
    if (!audioFile) {
      setError("Please select an audio file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('language', sttLanguage);

      const response = await fetch('http://localhost:8001/api/stt', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSttResult(data.text);
        setError(null);
      } else {
        setError(data.error || 'STT failed');
      }
    } catch (error) {
      setError('Failed to process STT request');
      console.error('STT error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceChat = async () => {
    if (!chatText.trim()) {
      setError("Please enter text for voice chat");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/api/voice_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: chatText,
          language: chatLanguage,
          stream: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newChat = {
          text: chatText,
          response: data.response,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, newChat]);
        setChatText("");
        setError(null);
      } else {
        setError(data.error || 'Voice chat failed');
      }
    } catch (error) {
      setError('Failed to process voice chat');
      console.error('Voice chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setError('Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsTtsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsTtsPlaying(false);
    }
  };

  const downloadAudio = () => {
    if (ttsAudioUrl) {
      const a = document.createElement('a');
      a.href = ttsAudioUrl;
      a.download = 'speech.wav';
      a.click();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voice Studio</h1>
          <p className="text-muted-foreground">Bengali Voice Processing System</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          {voiceStatus && (
            <Badge variant="outline">
              Queue: {voiceStatus.queue_size}
            </Badge>
          )}
        </div>
      </div>

      {/* System Status */}
      {voiceStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{voiceStatus.stats.cpu_usage}%</div>
                <div className="text-sm text-muted-foreground">CPU Usage</div>
                <Progress value={voiceStatus.stats.cpu_usage} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{voiceStatus.stats.memory_usage}%</div>
                <div className="text-sm text-muted-foreground">Memory Usage</div>
                <Progress value={voiceStatus.stats.memory_usage} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{voiceStatus.stats.tts_requests}</div>
                <div className="text-sm text-muted-foreground">TTS Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{voiceStatus.stats.stt_requests}</div>
                <div className="text-sm text-muted-foreground">STT Requests</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>Volume: {Math.round(voiceStatus.audio_config.volume * 100)}%</span>
              <span>Speed: {voiceStatus.audio_config.speed} WPM</span>
              <span>Format: {voiceStatus.audio_config.format.toUpperCase()}</span>
              {voiceStatus.is_playing && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Volume2 className="h-3 w-3" />
                  <span>Playing</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="tts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tts" className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4" />
            <span>TTS</span>
          </TabsTrigger>
          <TabsTrigger value="stt" className="flex items-center space-x-2">
            <Mic className="h-4 w-4" />
            <span>STT</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Voice Chat</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* TTS Tab */}
        <TabsContent value="tts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Text-to-Speech</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tts-language">Language</Label>
                  <Select value={ttsLanguage} onValueChange={setTtsLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tts-voice">Voice</Label>
                  <Select value={ttsVoice} onValueChange={setTtsVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tts-stream"
                    checked={ttsStream}
                    onCheckedChange={setTtsStream}
                  />
                  <Label htmlFor="tts-stream">Stream Audio</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="tts-text">Text</Label>
                <Textarea
                  id="tts-text"
                  placeholder="Enter text to convert to speech..."
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleTTS} 
                  disabled={isLoading || !ttsText.trim()}
                  className="flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>Convert to Speech</span>
                    </>
                  )}
                </Button>

                {ttsAudioUrl && !ttsStream && (
                  <>
                    <Button variant="outline" onClick={playAudio} disabled={isTtsPlaying}>
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={pauseAudio} disabled={!isTtsPlaying}>
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={downloadAudio}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {ttsAudioUrl && (
                <audio ref={audioRef} src={ttsAudioUrl} onEnded={() => setIsTtsPlaying(false)} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STT Tab */}
        <TabsContent value="stt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Speech-to-Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stt-language">Language</Label>
                  <Select value={sttLanguage} onValueChange={setSttLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                    className="flex items-center space-x-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="audio-file">Audio File</Label>
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button 
                onClick={handleSTT} 
                disabled={isLoading || !audioFile}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FileAudio className="h-4 w-4" />
                    <span>Convert to Text</span>
                  </>
                )}
              </Button>

              {sttResult && (
                <div>
                  <Label>Result</Label>
                  <Textarea value={sttResult} readOnly rows={4} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chat-language">Language</Label>
                  <Select value={chatLanguage} onValueChange={setChatLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="chat-text">Message</Label>
                <Textarea
                  id="chat-text"
                  placeholder="Type your message..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleVoiceChat} 
                disabled={isLoading || !chatText.trim()}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    <span>Send Message</span>
                  </>
                )}
              </Button>

              {chatHistory.length > 0 && (
                <div className="space-y-2">
                  <Label>Chat History</Label>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {chatHistory.map((chat, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="text-sm text-muted-foreground">
                          {new Date(chat.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="font-medium">You: {chat.text}</div>
                        <div className="text-blue-600">Response: {chat.response}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Badge variant={log.type === 'tts' ? 'default' : 'secondary'}>
                        {log.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        <Languages className="h-3 w-3 mr-1" />
                        {log.language}
                      </Badge>
                      {log.text_length && (
                        <span className="text-sm text-muted-foreground">
                          {log.text_length} chars
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.processing_time_ms}ms
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 