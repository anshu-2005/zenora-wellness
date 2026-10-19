import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import FloatingBackground from '@/components/FloatingBackground'
import { Send, Bot, User, Sparkles, ShieldAlert, PhoneCall } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chatService } from '@/lib/api'

type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [crisisAlert, setCrisisAlert] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    chatService.getMessages().then((history) => {
      if (history && history.length > 0) {
        setMessages(history.map((h: any) => ({
          id: h.id,
          text: h.text || h.message,
          sender: h.sender,
          timestamp: new Date(h.timestamp || h.created_at)
        })))
      } else {
        setMessages([
          {
            id: '1',
            text: "Hello! I'm your ZENORA AI Companion. I'm here to listen without judgment, help you explore your thoughts, and share grounding exercises whenever you feel overwhelmed. How are you feeling right now?",
            sender: 'bot',
            timestamp: new Date(),
          }
        ])
      }
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    if (!newMessage.trim() || isTyping) return

    const userText = newMessage.trim()
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setNewMessage('')
    setIsTyping(true)

    // Check crisis phrases on client as well
    if (/hurt myself|kill myself|suicide|end my life|better off dead|want to die/i.test(userText)) {
      setCrisisAlert(true)
    }

    try {
      const response = await chatService.sendMessage(userText)
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.bot_reply,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I hear you. Taking time to put feelings into words is a healthy practice. How else can I support you today?",
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date)
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <FloatingBackground />

      <div className="zenora-container max-w-4xl mx-auto px-4">
        {/* Crisis Help Banner if triggered */}
        {crisisAlert && (
          <div className="mb-4 p-4 bg-red-100/95 border border-red-300 rounded-2xl flex items-center justify-between gap-4 text-red-950 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                Emergency Crisis Support is available 24/7. Call Tele-MANAS at <strong>14416</strong> or <strong>988</strong>.
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setCrisisAlert(false)} className="text-xs text-red-700">
              Dismiss
            </Button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/90 backdrop-blur-md shadow-lg border border-white/60 flex flex-col h-[75vh] overflow-hidden rounded-2xl">
            {/* Header */}
            <div className="p-4 border-b border-border bg-white/70 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    ZENORA AI Companion <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </h2>
                  <p className="text-xs text-muted-foreground">Supportive, sentiment-aware dialogue assistant</p>
                </div>
              </div>
              <Badge variant="outline" className="text-3xs bg-green-50 text-green-700 border-green-200">
                Online & Ready
              </Badge>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs",
                      message.sender === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-xs"
                        : "bg-white border border-border/80 text-gray-900 rounded-tl-xs"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p
                      className={cn(
                        "text-3xs mt-1 text-right",
                        message.sender === 'user' ? "text-primary-foreground/75" : "text-muted-foreground"
                      )}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-border/80 p-3 rounded-2xl rounded-tl-xs shadow-2xs">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100"></span>
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 sm:p-4 border-t border-border bg-white/70">
              <div className="flex gap-2">
                <Input
                  placeholder="Type what is on your mind..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isTyping}
                  className="zenora-input bg-white text-xs sm:text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isTyping || !newMessage.trim()}
                  className="zenora-button-primary px-4 sm:px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-3xs text-center text-muted-foreground mt-2">
                ZENORA AI is designed for supportive wellness conversations and is not a clinical crisis service.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Chat
