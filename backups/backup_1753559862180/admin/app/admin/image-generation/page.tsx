'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Image, Download, RefreshCw, Plus } from 'lucide-react';

interface ImageGeneration {
  id: number;
  prompt: string;
  provider_id: number;
  image_url?: string;
  image_path?: string;
  width: number;
  height: number;
  style: string;
  processing_time?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export default function ImageGenerationPage() {
  const [generations, setGenerations] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newWidth, setNewWidth] = useState(512);
  const [newHeight, setNewHeight] = useState(512);
  const [newStyle, setNewStyle] = useState('realistic');

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/image-generation?limit=20');
      const data = await response.json();
      if (data.success) {
        setGenerations(data.data);
      }
    } catch (error) {
      console.error('Error fetching image generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGeneration = async () => {
    if (!newPrompt.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: newPrompt,
          width: newWidth,
          height: newHeight,
          style: newStyle,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewPrompt('');
        fetchGenerations();
      }
    } catch (error) {
      console.error('Error creating image generation:', error);
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
          <h1 className="text-3xl font-bold">Image Generation</h1>
          <p className="text-muted-foreground">Create and manage AI-generated images</p>
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
            Create New Image
          </CardTitle>
          <CardDescription>Generate a new image using AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Input
                id="prompt"
                placeholder="Describe the image you want to generate..."
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={newStyle} onValueChange={setNewStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="artistic">Artistic</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Select value={newWidth.toString()} onValueChange={(value) => setNewWidth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="256">256px</SelectItem>
                  <SelectItem value="512">512px</SelectItem>
                  <SelectItem value="768">768px</SelectItem>
                  <SelectItem value="1024">1024px</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Select value={newHeight.toString()} onValueChange={(value) => setNewHeight(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="256">256px</SelectItem>
                  <SelectItem value="512">512px</SelectItem>
                  <SelectItem value="768">768px</SelectItem>
                  <SelectItem value="1024">1024px</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={createGeneration} 
                disabled={creating || !newPrompt.trim()}
                className="w-full"
              >
                {creating ? 'Generating...' : 'Generate Image'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generations List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
          <CardDescription>View and manage your generated images</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : generations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No generations found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generations.map((generation) => (
                <Card key={generation.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {generation.image_url ? (
                        <img
                          src={generation.image_url}
                          alt={generation.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        {getStatusBadge(generation.status)}
                        <span className="text-sm text-muted-foreground">
                          {generation.width}x{generation.height}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{generation.prompt}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(generation.created_at)}
                      </p>
                      {generation.status === 'completed' && generation.image_url && (
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
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