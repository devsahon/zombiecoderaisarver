'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, RefreshCw, Plus, Send } from 'lucide-react';

interface Communication {
  id: number;
  type: 'email' | 'sms';
  provider_id: number;
  recipient: string;
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  created_at: string;
}

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newType, setNewType] = useState<'email' | 'sms'>('email');
  const [newRecipient, setNewRecipient] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      const response = await fetch('/api/communications?limit=50');
      const data = await response.json();
      if (data.success) {
        setCommunications(data.data);
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendCommunication = async () => {
    if (!newRecipient.trim() || !newContent.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newType,
          recipient: newRecipient,
          subject: newSubject,
          content: newContent,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewRecipient('');
        setNewSubject('');
        setNewContent('');
        fetchCommunications();
      }
    } catch (error) {
      console.error('Error sending communication:', error);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      sent: { color: 'bg-blue-100 text-blue-800', text: 'Sent' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    return type === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Communications</h1>
          <p className="text-muted-foreground">Send and manage emails and SMS messages</p>
        </div>
        <Button onClick={fetchCommunications} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Send New Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Send New Message
          </CardTitle>
          <CardDescription>Send an email or SMS message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={newType} onValueChange={(value: 'email' | 'sms') => setNewType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder={newType === 'email' ? 'email@example.com' : '+1234567890'}
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
              />
            </div>
          </div>
          {newType === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              placeholder={newType === 'email' ? 'Email content...' : 'SMS message...'}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
          </div>
          <Button 
            onClick={sendCommunication} 
            disabled={sending || !newRecipient.trim() || !newContent.trim()}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Communications</CardTitle>
          <CardDescription>View and track your sent messages</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No communications found</div>
          ) : (
            <div className="space-y-4">
              {communications.map((communication) => (
                <Card key={communication.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(communication.type)}
                        <span className="text-sm font-medium capitalize">{communication.type}</span>
                      </div>
                      {getStatusBadge(communication.status)}
                    </div>
                    <div className="space-y-1 mb-2">
                      <p className="text-sm font-medium">To: {communication.recipient}</p>
                      {communication.subject && (
                        <p className="text-sm text-muted-foreground">Subject: {communication.subject}</p>
                      )}
                    </div>
                    <p className="text-sm mb-3 line-clamp-2">{communication.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(communication.created_at)}</span>
                      {communication.sent_at && (
                        <span>Sent: {formatDate(communication.sent_at)}</span>
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