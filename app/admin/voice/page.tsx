'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Pause, Square, Volume2, Settings, Download, 
  Mic, MicOff, FileAudio, Clock, Activity, Zap
} from 'lucide-react';

interface VoiceConfig {
  name: string;
  language: string;
  gender: string;
  speed: number;
  pitch: number;
  volume: number;
  engine: string;
}

interface AudioInfo {
  text: string;
  duration: number;
  sample_rate: number;
  format: string;
  file_path: string;
  generated_at: string;
}

interface VoiceStatus {
  is_playing: boolean;
  is_paused: boolean;
  current_position: number;
  current_audio: AudioInfo | null;
}

export default function VoicePage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [selectedEngine, setSelectedEngine] = useState('coqui');
  const [voices, setVoices] = useState<Record<string, VoiceConfig>>({});
  const [engines, setEngines] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<VoiceStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentAudio, setRecentAudio] = useState<AudioInfo[]>([]);

  useEffect(() => {
    fetchVoices();
    fetchStatus();
    
    // Poll status every 2 seconds
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/voice');
      const data = await response.json();
      
      if (data.success) {
        setVoices(data.data.voices);
        setEngines(data.data.engines);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/voice?action=status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data.status);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleSpeak = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          engine: selectedEngine
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRecentAudio(prev => [data.data.audio_info, ...prev.slice(0, 9)]);
        fetchStatus();
      } else {
        console.error('Voice generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePause = async () => {
    try {
      await fetch('/api/voice?action=pause');
      fetchStatus();
    } catch (error) {
      console.error('Error pausing:', error);
    }
  };

  const handleResume = async () => {
    try {
      await fetch('/api/voice?action=resume');
      fetchStatus();
    } catch (error) {
      console.error('Error resuming:', error);
    }
  };

  const handleStop = async () => {
    try {
      await fetch('/api/voice?action=stop');
      fetchStatus();
    } catch (error) {
      console.error('Error stopping:', error);
    }
  };

  const handleVoiceChange = async (voice: string) => {
    try {
      const response = await fetch('/api/voice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedVoice(voice);
      }
    } catch (error) {
      console.error('Error changing voice:', error);
    }
  };

  const getStatusBadge = () => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    
    if (status.is_playing) {
      return <Badge variant="default" className="bg-green-100 text-green-800">
        <Activity className="h-3 w-3 mr-1 animate-pulse" />
        Playing
      </Badge>;
    } else if (status.is_paused) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Pause className="h-3 w-3 mr-1" />
        Paused
      </Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        <Square className="h-3 w-3 mr-1" />
        Stopped
      </Badge>;
    }
  };

  const getEngineIcon = (engine: string) => {
    switch (engine) {
      case 'coqui': return <Mic className="h-4 w-4" />;
      case 'espnet': return <Zap className="h-4 w-4" />;
      case 'opentts': return <Settings className="h-4 w-4" />;
      default: return <Volume2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">বাংলা ভয়েস সিস্টেম</h1>
          <p className="text-muted-foreground">
            টেক্সট-টু-স্পিচ সিস্টেম - Coqui TTS, ESPnet, OpenTTS
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      <Tabs defaultValue="speak" className="space-y-4">
        <TabsList>
          <TabsTrigger value="speak">টেক্সট স্পিচ</TabsTrigger>
          <TabsTrigger value="voices">ভয়েস কনফিগারেশন</TabsTrigger>
          <TabsTrigger value="history">অডিও ইতিহাস</TabsTrigger>
        </TabsList>

        <TabsContent value="speak" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>টেক্সট স্পিচে রূপান্তর</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">ভয়েস সিলেক্ট করুন</label>
                  <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(voices).map(([name, config]) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            {getEngineIcon(config.engine)}
                            {config.name} ({config.gender})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">ইঞ্জিন সিলেক্ট করুন</label>
                  <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coqui">Coqui TTS</SelectItem>
                      <SelectItem value="espnet">ESPnet TTS</SelectItem>
                      <SelectItem value="opentts">OpenTTS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">বর্তমান ভয়েস</label>
                  <div className="text-sm text-muted-foreground">
                    {voices[selectedVoice]?.name || 'Default'} - {voices[selectedVoice]?.gender || 'Female'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">টেক্সট লিখুন</label>
                <Textarea
                  placeholder="এখানে বাংলা টেক্সট লিখুন..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSpeak} 
                  disabled={!text.trim() || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      জেনারেট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      স্পিচ জেনারেট করুন
                    </>
                  )}
                </Button>

                {status?.is_playing && (
                  <>
                    <Button variant="outline" onClick={handlePause}>
                      <Pause className="h-4 w-4 mr-2" />
                      পজ
                    </Button>
                    <Button variant="outline" onClick={handleResume}>
                      <Play className="h-4 w-4 mr-2" />
                      চালু
                    </Button>
                    <Button variant="outline" onClick={handleStop}>
                      <Square className="h-4 w-4 mr-2" />
                      বন্ধ
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>উপলব্ধ ভয়েস কনফিগারেশন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(voices).map(([name, config]) => (
                  <Card key={name} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getEngineIcon(config.engine)}
                          <h3 className="font-semibold">{config.name}</h3>
                        </div>
                        <Badge variant={config.gender === 'male' ? 'default' : 'secondary'}>
                          {config.gender}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>ইঞ্জিন:</span>
                          <span className="font-medium">{config.engine}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>গতি:</span>
                          <span className="font-medium">{config.speed}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>পিচ:</span>
                          <span className="font-medium">{config.pitch}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ভলিউম:</span>
                          <span className="font-medium">{config.volume}</span>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => handleVoiceChange(name)}
                      >
                        সিলেক্ট করুন
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ইঞ্জিন স্ট্যাটাস</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(engines).map(([engine, voices]) => (
                  <div key={engine} className="border rounded p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {getEngineIcon(engine)}
                      <h4 className="font-medium">{engine.toUpperCase()}</h4>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(voices as Record<string, string>).map(([voice, name]) => (
                        <div key={voice} className="text-sm text-muted-foreground">
                          • {name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>সাম্প্রতিক অডিও</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAudio.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>কোন অডিও জেনারেট করা হয়নি</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAudio.map((audio, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileAudio className="h-4 w-4" />
                          <span className="font-medium">অডিও #{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {audio.duration.toFixed(1)}s
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            ডাউনলোড
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {audio.text.length > 100 ? audio.text.substring(0, 100) + '...' : audio.text}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        জেনারেট: {new Date(audio.generated_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 