'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Video, Download, RefreshCw, Plus } from 'lucide-react';

interface VideoGeneration {
  id: number;
  prompt: string;
  provider_id: number;
  video_url?: string;
  video_path?: string;
  duration: number;
  fps: number;
  resolution: string;
  processing_time?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export default function VideoGenerationPage() {
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newDuration, setNewDuration] = useState(5);
  const [newFps, setNewFps] = useState(24);
  const [newResolution, setNewResolution] = useState('1920x1080');

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/video-generation?limit=10');
      const data = await response.json();
      if (data.success) {
        setGenerations(data.data);
      }
    } catch (error) {
      console.error('Error fetching video generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGeneration = async () => {
    if (!newPrompt.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/video-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: newPrompt,
          duration: newDuration,
          fps: newFps,
          resolution: newResolution,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewPrompt('');
        fetchGenerations();
      }
    } catch (error) {
      console.error('Error creating video generation:', error);
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      error: { color: 'bg-red-100 text-red-800', text: 'Error' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Generation</h1>
          <p className="text-muted-foreground">Create and manage AI-generated videos</p>
        </div>
        <Button onClick={fetchGenerations} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Create New Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Video
          </CardTitle>
          <CardDescription>Generate a new video using AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              placeholder="Describe the video you want to generate..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Select value={newDuration.toString()} onValueChange={(value) => setNewDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3s</SelectItem>
                  <SelectItem value="5">5s</SelectItem>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="15">15s</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fps">FPS</Label>
              <Select value={newFps.toString()} onValueChange={(value) => setNewFps(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 FPS</SelectItem>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="60">60 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Select value={newResolution} onValueChange={setNewResolution}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1280x720">720p</SelectItem>
                  <SelectItem value="1920x1080">1080p</SelectItem>
                  <SelectItem value="2560x1440">1440p</SelectItem>
                  <SelectItem value="3840x2160">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={createGeneration} 
                disabled={creating || !newPrompt.trim()}
                className="w-full"
              >
                {creating ? 'Generating...' : 'Generate Video'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generations List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
          <CardDescription>View and manage your generated videos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : generations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No generations found</div>
          ) : (
            <div className="space-y-4">
              {generations.map((generation) => (
                <Card key={generation.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(generation.status)}
                      <span className="text-sm text-muted-foreground">
                        {generation.duration}s • {generation.fps}fps • {generation.resolution}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{generation.prompt}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {formatDate(generation.created_at)}
                    </p>
                    {generation.status === 'completed' && generation.video_url && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 