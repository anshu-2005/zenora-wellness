import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import FloatingBackground from '@/components/FloatingBackground'
import { journalService } from '@/lib/api'
import {
  Sparkles, Search, Trash2, AlertTriangle, ShieldAlert,
  Calendar, Tag, Smile, Frown, Meh, PhoneCall
} from 'lucide-react'

type JournalEntry = {
  id: string
  title: string
  content: string
  entry?: string
  sentiment_score?: number
  sentiment_label?: string
  emotion_tags?: string[]
  crisis_flag?: boolean
  recommendation?: string
  date: string
}

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'Positive' | 'Neutral' | 'Negative'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    journalService.getJournals().then((res) => {
      setEntries(res || [])
    })
  }, [])

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please add a title for your reflection.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Missing reflection",
        description: "Please share a few thoughts in your journal entry.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await journalService.saveJournal({
        title: title.trim(),
        entry: content.trim()
      })

      const newEntry: JournalEntry = {
        id: response.journal.id,
        title: response.journal.title,
        content: response.journal.entry || response.journal.content,
        entry: response.journal.entry,
        sentiment_score: response.journal.sentiment_score,
        sentiment_label: response.journal.sentiment_label,
        emotion_tags: response.journal.emotion_tags || [],
        crisis_flag: response.journal.crisis_flag,
        recommendation: response.journal.recommendation,
        date: response.journal.date || new Date().toISOString()
      }

      setEntries([newEntry, ...entries])
      setTitle('')
      setContent('')

      // Trigger Crisis Support Modal if crisis flag detected
      if (newEntry.crisis_flag) {
        setCrisisAlert(newEntry.recommendation || "Please reach out to emergency crisis support.")
      }

      toast({
        title: "Reflection Saved & Analyzed",
        description: `Sentiment: ${newEntry.sentiment_label} (${newEntry.sentiment_score && newEntry.sentiment_score > 0 ? '+' : ''}${newEntry.sentiment_score})`,
      })
    } catch (err) {
      toast({
        title: "Error saving entry",
        description: "Could not save your journal reflection. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await journalService.deleteJournal(id)
    setEntries(entries.filter((entry) => entry.id !== id))
    if (selectedEntry?.id === id) {
      setSelectedEntry(null)
    }
    toast({
      title: "Entry deleted",
      description: "The reflection entry has been removed.",
    })
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesFilter =
      sentimentFilter === 'all' ||
      (entry.sentiment_label || '').toLowerCase() === sentimentFilter.toLowerCase()

    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.content || entry.entry || '').toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getSentimentBadge = (label?: string, score?: number) => {
    const sc = score !== undefined ? ` (${score > 0 ? '+' : ''}${score})` : ''
    if (label === 'Positive') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 flex items-center gap-1">
          <Smile className="w-3 h-3 text-green-600" /> Positive{sc}
        </Badge>
      )
    }
    if (label === 'Negative') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 flex items-center gap-1">
          <Frown className="w-3 h-3 text-red-600" /> Negative{sc}
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 flex items-center gap-1">
        <Meh className="w-3 h-3 text-blue-600" /> Neutral{sc}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <FloatingBackground />

      <div className="zenora-container max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-2">
            AI & NLP Sentiment Analysis
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Reflective Journaling & Emotional Insights
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Write your thoughts freely. ZENORA automatically analyzes sentiment patterns, detects emotional themes, and provides evidence-informed wellness guidance.
          </p>
        </div>

        {/* Crisis Emergency Modal Banner */}
        {crisisAlert && (
          <div className="mb-8 p-5 bg-red-100/90 border border-red-300 rounded-2xl shadow-sm flex items-start gap-4 text-red-950">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-base text-red-900">Priority Crisis Intervention Notice</h3>
              <p className="text-xs sm:text-sm text-red-800 mt-1 leading-relaxed">{crisisAlert}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> Call Tele-MANAS: 14416
                </Button>
                <Button size="sm" variant="outline" className="border-red-300 text-red-900 text-xs">
                  Call or Text 988 (Lifeline)
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setCrisisAlert(null)} className="text-xs text-red-800">
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New Journal Entry Form */}
        <Card className="bg-white/90 backdrop-blur-md shadow-md border border-white/60 mb-10">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Today's Reflection
            </CardTitle>
            <CardDescription className="text-xs">
              Express your feelings, events from your day, or mindfulness observations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title for today's reflection (e.g. Taking time for myself, A challenging afternoon)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="zenora-input bg-white font-medium text-sm"
            />
            <Textarea
              placeholder="Write your thoughts here... How did you feel today? What went well, and what felt heavy?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="zenora-input bg-white resize-y text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">
                Protected with VADER NLP sentiment evaluation and crisis scanning
              </span>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="zenora-button-primary shadow-sm"
              >
                {isSubmitting ? 'Analyzing Sentiment...' : 'Save & Analyze Reflection'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selected Entry Detail View */}
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-white/95 backdrop-blur-md border border-primary/30 shadow-lg">
              <CardHeader className="border-b pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getSentimentBadge(selectedEntry.sentiment_label, selectedEntry.sentiment_score)}
                      {selectedEntry.crisis_flag && (
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                          <AlertTriangle className="w-3 h-3" /> Crisis Alert
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{selectedEntry.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(selectedEntry.date)}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)} className="text-xs">
                    Close View
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.content || selectedEntry.entry}
                </p>

                {/* Emotion Tags */}
                {selectedEntry.emotion_tags && selectedEntry.emotion_tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Extracted Emotional Themes:
                    </span>
                    {selectedEntry.emotion_tags.map((t, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-none text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {selectedEntry.recommendation && (
                  <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-gray-700">
                    <span className="font-semibold text-gray-900">AI Wellness Recommendation: </span>
                    {selectedEntry.recommendation}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Journal Entries List & Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Past Reflections ({filteredEntries.length})
            </h2>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Sentiment Filter buttons */}
              <div className="flex bg-muted/60 p-1 rounded-xl text-xs">
                {(['all', 'Positive', 'Neutral', 'Negative'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSentimentFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      sentimentFilter === filter
                        ? 'bg-white shadow-2xs text-primary'
                        : 'text-muted-foreground hover:text-gray-900'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-white rounded-xl"
                />
              </div>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <Card className="bg-white/80 p-8 text-center text-muted-foreground">
              <p>No reflections found matching your criteria.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="bg-white/85 backdrop-blur-md border border-white/60 shadow-xs hover:shadow-md transition-all cursor-pointer p-4 group"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getSentimentBadge(entry.sentiment_label, entry.sentiment_score)}
                      {entry.crisis_flag && (
                        <Badge variant="destructive" className="text-3xs">
                          Risk Flag
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 h-7 w-7"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-primary transition-colors">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {entry.content || entry.entry}
                  </p>

                  <div className="flex justify-between items-center text-3xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>{formatDate(entry.date)}</span>
                    <span className="text-primary font-medium group-hover:underline">Read details →</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Journal
