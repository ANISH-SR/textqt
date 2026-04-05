"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, 
  Code2, 
  BarChart3, 
  Brain, 
  Upload, 
  Send,
  Sparkles,
  Database,
  LogOut,
  X,
  RefreshCw
} from "lucide-react"
import { api, ChatResponse, UploadResponse } from "@/src/api"

interface Message {
  role: "user" | "assistant"
  content: string
  sql?: string
  results?: Array<Record<string, any>>
  chart_data?: any
  memory_applied?: string[]
}

export function ChatInterface() {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "sql" | "result" | "memory" | "upload">("chat")
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null)
  const [tables, setTables] = useState<Record<string, any[]>>({})
  const [memories, setMemories] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isSignedIn) {
      loadTables()
      loadMemories()
    }
  }, [isSignedIn])

  const loadMemories = async () => {
    try {
      const token = await getToken()
      if (!token) return
      const memoriesData = await api.getMemory('current_user', 'current_user', token)
      setMemories(memoriesData.memories || [])
    } catch (error) {
      console.error("Failed to load memories:", error)
    }
  }

  const loadTables = async () => {
    try {
      const token = await getToken()
      if (!token) return
      const tablesData = await api.getTables(token)
      setTables(tablesData.tables)
    } catch (error) {
      console.error("Failed to load tables:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !isSignedIn) return

    const userMessage: Message = {
      role: "user",
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const token = await getToken()
      if (!token) throw new Error("Not authenticated")
      const response = await api.chat({ message: input }, token)
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        sql: response.sql,
        results: response.results || [],
        chart_data: response.chart_data,
        memory_applied: response.memory_applied || []
      }

      setMessages(prev => [...prev, assistantMessage])
      // Refresh memories after chat
      await loadMemories()
      setActiveTab("result")
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}`
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !isSignedIn) return

    setIsLoading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error("Not authenticated")
      const uploadResponse = await api.uploadFile(file, token)
      setUploadedFile(uploadResponse)
      await loadTables() // Refresh tables after upload
      
      // Show success feedback
      const successMessage: Message = {
        role: "assistant",
        content: `✅ Successfully uploaded "${file.name}" with ${uploadResponse.rows} rows and ${uploadResponse.columns.length} columns. You can now ask questions about your data!`
      }
      setMessages(prev => [...prev, successMessage])
      
    } catch (error) {
      console.error("Upload failed:", error)
      // Show error message to user
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ ${error instanceof Error ? error.message : "Upload failed"}`
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      // Clear the file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setTables({})
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // Show confirmation message
    const removeMessage: Message = {
      role: "assistant",
      content: "📁 File removed. You can upload a new file to continue."
    }
    setMessages(prev => [...prev, removeMessage])
  }

  const currentMessage = messages[messages.length - 1]

  if (!isLoaded) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to access the chat interface.
          </p>
          <p className="text-sm text-muted-foreground">
            Use the Sign In button in the header to get started.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadedFile ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <Database className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">{uploadedFile.filename}</div>
                    <div className="text-sm text-green-600">
                      {uploadedFile.rows} rows • {uploadedFile.columns.length} columns
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload CSV/JSON
                </Button>
                <div className="text-sm text-muted-foreground">
                  Upload your data file to start asking questions
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="flex border-b">
            <TabsList className="grid w-full grid-cols-5 bg-transparent border-none">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="sql" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                SQL
              </TabsTrigger>
              <TabsTrigger value="result" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Memory
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-[500px]">
            {/* Chat Tab */}
            <TabsContent value="chat" className="m-0">
              <ScrollArea className="h-[400px] p-6">
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="mb-1 flex items-center gap-1 text-xs text-primary">
                            <Sparkles className="h-3 w-3" />
                            HydraDB
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-md rounded-2xl bg-muted px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Sparkles className="h-3 w-3" />
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              {/* Chat Input */}
              <Card className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={uploadedFile
                      ? "Ask questions about your data..."
                      : "Upload a file first to start asking questions..."
                    }
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    disabled={isLoading || !isSignedIn || !uploadedFile}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim() || !isSignedIn || !uploadedFile}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {uploadedFile && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Database className="h-3 w-3" />
                    <span>Ready to query {uploadedFile.filename} ({uploadedFile.rows} rows)</span>
                  </div>
                )}
              </Card>
            </div>
            </TabsContent>

            {/* SQL Tab */}
            <TabsContent value="sql" className="m-0">
              <div className="p-6">
                {currentMessage?.sql ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Code2 className="h-4 w-4" />
                      Generated SQL
                    </div>
                    <pre className="overflow-x-auto rounded-lg bg-secondary p-4 font-mono text-sm">
                      <code>{currentMessage.sql}</code>
                    </pre>
                    {currentMessage.memory_applied && currentMessage.memory_applied.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        Memory applied: {currentMessage.memory_applied.join(", ")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Ask a question to see the generated SQL
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="result" className="m-0">
              <div className="p-6">
                {currentMessage?.results && currentMessage.results.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Query Results</h3>
                    
                    {/* Simple Table */}
                    <div className="rounded-lg border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              {Object.keys(currentMessage.results[0]).map(key => (
                                <th key={key} className="px-4 py-2 text-left text-sm font-medium">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentMessage.results.slice(0, 10).map((row, i) => (
                              <tr key={i} className="border-b">
                                {Object.values(row).map((value, j) => (
                                  <td key={j} className="px-4 py-2 text-sm">
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Simple Chart Visualization */}
                    {currentMessage.chart_data && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Chart View</h4>
                        <div className="space-y-2">
                          {currentMessage.chart_data.data.labels.map((label: string, i: number) => {
                            const value = currentMessage.chart_data.data.datasets[0].data[i]
                            const maxValue = Math.max(...currentMessage.chart_data.data.datasets[0].data)
                            const percentage = (value / maxValue) * 100
                            
                            return (
                              <div key={`${label}-${i}`} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{label}</span>
                                  <span className="font-medium">{value.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                  <div
                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No results to display
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Memory Tab */}
            <TabsContent value="memory" className="m-0">
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Brain className="h-4 w-4" />
                    What HydraDB knows about your data
                  </div>
                  {memories.length > 0 ? (
                    <div className="space-y-3">
                      {memories.map((memory: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg bg-muted/30">
                          <div className="text-sm">
                            {memory.memories?.map((mem: any, memIndex: number) => (
                              <div key={memIndex} className="space-y-2">
                                {mem.user_assistant_pairs?.map((pair: any, pairIndex: number) => (
                                  <div key={pairIndex} className="space-y-1">
                                    <div className="font-medium text-blue-600">You:</div>
                                    <div className="text-sm pl-4">{pair.user}</div>
                                    <div className="font-medium text-green-600">Assistant:</div>
                                    <div className="text-sm pl-4">{pair.assistant}</div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No memories stored yet. Start chatting with your data to build up HydraDB's knowledge!
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Database Tab */}
            <TabsContent value="upload" className="m-0">
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Database className="h-4 w-4" />
                    Database Schema
                  </div>
                  {Object.keys(tables).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(tables).map(([tableName, columns]) => (
                        <div key={tableName} className="space-y-2">
                          <h4 className="font-medium">{tableName}</h4>
                          <div className="grid gap-2">
                            {columns.map((col: any, i: number) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{col.name}</span>
                                <Badge variant="outline">{col.type}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No tables found. Upload a CSV or JSON file to get started.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
