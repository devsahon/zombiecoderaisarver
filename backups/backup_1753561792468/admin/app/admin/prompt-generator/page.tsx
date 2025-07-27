"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, 
  Copy, 
  Save, 
  Download, 
  Upload, 
  Settings,
  Brain,
  MessageSquare,
  Code,
  FileText,
  Lightbulb,
  History,
  Star,
  Plus,
  Trash2,
  Edit,
  CheckCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminPromptGeneratorPage() {
  const [promptType, setPromptType] = useState('general')
  const [context, setContext] = useState('')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [savedPrompts, setSavedPrompts] = useState([
    { id: 1, name: 'Code Review Assistant', type: 'coding', prompt: 'Review this code for best practices...', rating: 5 },
    { id: 2, name: 'Content Writer', type: 'writing', prompt: 'Write engaging content about...', rating: 4 },
    { id: 3, name: 'Data Analyst', type: 'analysis', prompt: 'Analyze this dataset and provide insights...', rating: 5 }
  ])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const promptTemplates = {
    general: {
      title: "General Assistant",
      description: "Versatile prompts for various tasks",
      icon: Brain,
      templates: [
        "Help me with {task}",
        "Explain {concept} in simple terms",
        "Provide a step-by-step guide for {process}",
        "Analyze {topic} and give recommendations"
      ]
    },
    coding: {
      title: "Code Assistant",
      description: "Programming and development prompts",
      icon: Code,
      templates: [
        "Review this code for best practices: {code}",
        "Debug this {language} code: {code}",
        "Optimize this function for better performance",
        "Explain this algorithm step by step"
      ]
    },
    writing: {
      title: "Content Writer",
      description: "Writing and content creation prompts",
      icon: FileText,
      templates: [
        "Write a {tone} article about {topic}",
        "Create a compelling headline for {subject}",
        "Summarize this text in {length} words",
        "Generate ideas for {content_type}"
      ]
    },
    analysis: {
      title: "Data Analyst",
      description: "Data analysis and insights prompts",
      icon: MessageSquare,
      templates: [
        "Analyze this data and provide insights",
        "Create a summary report for {dataset}",
        "Identify trends in {data_type}",
        "Suggest improvements based on {metrics}"
      ]
    }
  }

  const generatePrompt = () => {
    setLoading(true)
    setTimeout(() => {
      const template = promptTemplates[promptType as keyof typeof promptTemplates]
      const randomTemplate = template.templates[Math.floor(Math.random() * template.templates.length)]
      
      let prompt = randomTemplate
        .replace('{task}', context || 'a specific task')
        .replace('{concept}', context || 'a complex concept')
        .replace('{process}', context || 'a process')
        .replace('{topic}', context || 'a topic')
        .replace('{code}', context || 'your code')
        .replace('{language}', context || 'programming language')
        .replace('{tone}', tone)
        .replace('{subject}', context || 'your subject')
        .replace('{length}', length === 'short' ? '100' : length === 'medium' ? '250' : '500')
        .replace('{content_type}', context || 'content')
        .replace('{dataset}', context || 'your dataset')
        .replace('{data_type}', context || 'your data')
        .replace('{metrics}', context || 'your metrics')

      setGeneratedPrompt(prompt)
      setLoading(false)
    }, 1500)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const savePrompt = () => {
    if (!generatedPrompt.trim()) return
    
    const newPrompt = {
      id: savedPrompts.length + 1,
      name: `Prompt ${savedPrompts.length + 1}`,
      type: promptType,
      prompt: generatedPrompt,
      rating: 5
    }
    setSavedPrompts([newPrompt, ...savedPrompts])
  }

  const deletePrompt = (id: number) => {
    setSavedPrompts(savedPrompts.filter(p => p.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Prompt Generator</h1>
          <p className="text-slate-600">Create, customize, and manage AI prompts for various tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt Generator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate AI Prompt
              </CardTitle>
              <CardDescription>Create customized prompts for different AI tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prompt Type Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(promptTemplates).map(([key, template]) => {
                  const IconComponent = template.icon
                  return (
                    <div
                      key={key}
                      onClick={() => setPromptType(key)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        promptType === key 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={`h-4 w-4 ${
                          promptType === key ? 'text-blue-600' : 'text-slate-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          promptType === key ? 'text-blue-600' : 'text-slate-700'
                        }`}>
                          {template.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{template.description}</p>
                    </div>
                  )
                })}
              </div>

              {/* Context Input */}
              <div>
                <Label htmlFor="context" className="text-sm font-medium">Context / Topic</Label>
                <Input
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Enter your topic, task, or context..."
                  className="mt-1"
                />
              </div>

              {/* Tone and Length */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tone" className="text-sm font-medium">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="length" className="text-sm font-medium">Length</Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generatePrompt} 
                disabled={loading} 
                className="w-full h-12"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Generate Prompt
                  </div>
                )}
              </Button>

              {/* Generated Prompt */}
              {generatedPrompt && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Generated Prompt</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={savePrompt}>
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={generatedPrompt}
                    readOnly
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Quick Templates
              </CardTitle>
              <CardDescription>Pre-built templates for common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {promptTemplates[promptType as keyof typeof promptTemplates].templates.map((template, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setContext('')
                      setGeneratedPrompt(template)
                    }}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium">{template}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Prompts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Saved Prompts
              </CardTitle>
              <CardDescription>Your favorite and frequently used prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedPrompts.map((prompt) => (
                  <div key={prompt.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{prompt.name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {prompt.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setGeneratedPrompt(prompt.prompt)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deletePrompt(prompt.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{prompt.prompt}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < prompt.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export/Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage Prompts
              </CardTitle>
              <CardDescription>Export and import your prompt library</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Prompts
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Prompts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 