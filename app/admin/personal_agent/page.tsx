'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  Send, 
  Brain, 
  Activity, 
  Settings, 
  Trash2,
  User,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

interface AgentResponse {
  action: string
  message: string
  priority: string
  suggestions: string[]
  context: {
    user_mood: string
    project_focus: string
    timestamp: string
    confidence: number
  }
}

interface AgentMemory {
  user_mood: string
  project_focus: string
  last_task: any
  conversation_history: any[]
  system_status: any
  preferences: any
  project_context: any
  user_patterns: any
}

export default function PersonalAgentPage() {
  const [input, setInput] = useState('')
  const [conversation, setConversation] = useState<Array<{
    user: string
    agent: AgentResponse
    timestamp: string
  }>>([])
  const [loading, setLoading] = useState(false)
  const [agentStatus, setAgentStatus] = useState<any>(null)
  const [agentMemory, setAgentMemory] = useState<AgentMemory | null>(null)
  const [language, setLanguage] = useState<'bn' | 'en'>('bn')

  useEffect(() => {
    checkAgentStatus()
    loadAgentMemory()
  }, [])

  const checkAgentStatus = async () => {
    try {
      const response = await fetch('/api/agent/personal/status')
      const data = await response.json()
      setAgentStatus(data)
    } catch (error) {
      console.error('Error checking agent status:', error)
    }
  }

  const loadAgentMemory = async () => {
    try {
      const response = await fetch('/api/agent/personal/memory')
      const data = await response.json()
      if (data.success) {
        setAgentMemory(data.data)
      }
    } catch (error) {
      console.error('Error loading agent memory:', error)
    }
  }

  const clearMemory = async () => {
    try {
      const response = await fetch('/api/agent/personal/memory', {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        setConversation([])
        loadAgentMemory()
      }
    } catch (error) {
      console.error('Error clearing memory:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    setLoading(true)

    // Add user message to conversation
    const newConversation = [...conversation, {
      user: userMessage,
      agent: {} as AgentResponse,
      timestamp: new Date().toISOString()
    }]
    setConversation(newConversation)

    try {
      const response = await fetch('/api/agent/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: userMessage,
          context: {
            user_id: 'shawon',
            language: language,
            current_page: 'personal_agent'
          }
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Update conversation with agent response
        const updatedConversation = [...newConversation]
        updatedConversation[updatedConversation.length - 1].agent = data.data
        setConversation(updatedConversation)
        
        // Reload memory to get updated state
        loadAgentMemory()
      } else {
        console.error('Agent error:', data.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'system_diagnose': return <Activity className="h-4 w-4" />
      case 'code_review': return <Settings className="h-4 w-4" />
      case 'image_to_html': return <Zap className="h-4 w-4" />
      case 'project_suggestion': return <Brain className="h-4 w-4" />
      case 'database_analyze': return <Info className="h-4 w-4" />
      case 'provider_manage': return <Settings className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {language === 'bn' ? 'পার্সোনাল এজেন্ট' : 'Personal Agent'}
        </h1>
        <p className="text-slate-600 mt-2">
          {language === 'bn'
            ? 'আপনার ব্যক্তিগত AI সহকারী - সিস্টেম ডায়াগনোসিস, কোড রিভিউ, এবং প্রজেক্ট পরামর্শ'
            : 'Your personal AI assistant - system diagnosis, code review, and project guidance'
          }
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {language === 'bn' ? 'এজেন্ট স্ট্যাটাস' : 'Agent Status'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {agentStatus?.success ? (language === 'bn' ? 'সক্রিয়' : 'Active') : (language === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive')}
                </p>
              </div>
              {agentStatus?.success ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {language === 'bn' ? 'কনভারসেশন' : 'Conversations'}
                </p>
                <p className="text-2xl font-bold">{conversation.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {language === 'bn' ? 'মেমরি সাইজ' : 'Memory Size'}
                </p>
                <p className="text-2xl font-bold">
                  {agentMemory?.conversation_history?.length || 0}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {language === 'bn' ? 'চ্যাট ইন্টারফেস' : 'Chat Interface'}
              </CardTitle>
              <CardDescription>
                {language === 'bn' ? 'আপনার এজেন্টের সাথে কথা বলুন' : 'Chat with your personal agent'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Conversation History */}
              <ScrollArea className="h-96 border rounded-lg p-4">
                {conversation.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>
                      {language === 'bn' 
                        ? 'কেমন আছো বন্ধু? আমি তোমার AI সহকারী। তুমি চাইলে আমাকে context দাও—আমি এখুনি তোমাকে সাহায্য করি।'
                        : 'Hello! I\'m your AI assistant. Give me some context and I\'ll help you right away.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((msg, index) => (
                      <div key={index} className="space-y-2">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-blue-100 rounded-lg p-3 max-w-xs">
                            <p className="text-sm">{msg.user}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Agent Response */}
                        {msg.agent && Object.keys(msg.agent).length > 0 && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                              <div className="flex items-center gap-2 mb-2">
                                {getActionIcon(msg.agent.action)}
                                <Badge className={getPriorityColor(msg.agent.priority)}>
                                  {msg.agent.priority}
                                </Badge>
                              </div>
                              <p className="text-sm mb-2">{msg.agent.message}</p>
                              
                              {msg.agent.suggestions && msg.agent.suggestions.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-600 mb-1">
                                    {language === 'bn' ? 'পরামর্শ:' : 'Suggestions:'}
                                  </p>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {msg.agent.suggestions.map((suggestion, idx) => (
                                      <li key={idx}>• {suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Type your message...'}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={loading || !input.trim()}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Info Panel */}
        <div className="space-y-4">
          {/* Agent Memory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {language === 'bn' ? 'এজেন্ট মেমরি' : 'Agent Memory'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentMemory && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>{language === 'bn' ? 'মুড:' : 'Mood:'}</span>
                    <Badge variant="outline">{agentMemory.user_mood}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{language === 'bn' ? 'প্রজেক্ট:' : 'Project:'}</span>
                    <span className="font-medium">{agentMemory.project_focus}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{language === 'bn' ? 'ভাষা:' : 'Language:'}</span>
                    <Badge variant="outline">{agentMemory.preferences?.language || 'bn'}</Badge>
                  </div>
                  {agentMemory.last_task && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600 mb-1">
                        {language === 'bn' ? 'শেষ কাজ:' : 'Last Task:'}
                      </p>
                      <p className="text-xs font-medium">{agentMemory.last_task.action}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {language === 'bn' ? 'দ্রুত কাজ' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setInput('সিস্টেমে একটা সমস্যা হয়েছে')}
              >
                <Activity className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'সিস্টেম চেক' : 'System Check'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setInput('কোড রিভিউ করতে হবে')}
              >
                <Settings className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'কোড রিভিউ' : 'Code Review'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setInput('প্রজেক্টে পরামর্শ চাই')}
              >
                <Brain className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'প্রজেক্ট পরামর্শ' : 'Project Advice'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-red-600"
                onClick={clearMemory}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === 'bn' ? 'মেমরি মুছুন' : 'Clear Memory'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 