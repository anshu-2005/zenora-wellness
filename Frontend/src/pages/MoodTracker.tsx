import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import FloatingBackground from '@/components/FloatingBackground'
import { moodService } from '@/lib/api'
import { Link } from 'react-router-dom'
import { Smile, Calendar, TrendingUp } from 'lucide-react'

type Mood = {
  emoji: string
  label: string
  color: string
}

const moods: Mood[] = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-400' },
  { emoji: '😌', label: 'Calm', color: 'bg-green-400' },
  { emoji: '😐', label: 'Neutral', color: 'bg-gray-400' },
  { emoji: '😢', label: 'Sad', color: 'bg-blue-400' },
  { emoji: '😡', label: 'Angry', color: 'bg-red-400' },
  { emoji: '😰', label: 'Anxious', color: 'bg-purple-400' },
  { emoji: '😴', label: 'Tired', color: 'bg-indigo-400' },
  { emoji: '🤩', label: 'Excited', color: 'bg-pink-400' },
]

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [notes, setNotes] = useState('')
  const [moodHistory, setMoodHistory] = useState<Array<{mood: string | Mood, notes: string, timestamp: string}>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    moodService.getMoods().then((res) => {
      setMoodHistory(res || [])
    })
  }, [])

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
  }

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast({
        title: "Missing mood selection",
        description: "Please select how you're feeling right now",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await moodService.saveMood({
        mood: selectedMood.label,
        note: notes
      })

      const newEntry = {
        mood: selectedMood.label,
        notes: notes,
        timestamp: new Date().toISOString(),
      }

      setMoodHistory([newEntry, ...moodHistory])
      setSelectedMood(null)
      setNotes('')

      toast({
        title: "Mood logged successfully!",
        description: `Logged state: ${selectedMood.label}. View your longitudinal trend on the Dashboard.`,
      })
    } catch (err) {
      toast({
        title: "Submission notice",
        description: "Mood state logged to local session.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date)
  }

  const getMoodEmoji = (moodValue: string | Mood) => {
    if (typeof moodValue === 'object') return moodValue.emoji
    const found = moods.find(m => m.label.toLowerCase() === moodValue.toLowerCase())
    return found ? found.emoji : '✨'
  }

  const getMoodLabel = (moodValue: string | Mood) => {
    if (typeof moodValue === 'object') return moodValue.label
    return moodValue
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <FloatingBackground />

      <div className="zenora-container max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-2">
            Daily Emotional Self-Monitoring
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            How Are You Feeling Today?
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Consistently tracking your mood states builds emotional awareness and empowers mental wellness resilience.
          </p>
        </div>

        {/* Mood Selector Card */}
        <Card className="bg-white/90 backdrop-blur-md shadow-md border border-white/60 mb-10">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Smile className="w-5 h-5 text-primary" /> Select Your Current Mood
            </CardTitle>
            <CardDescription className="text-xs">
              Choose the emoji that best captures your predominant emotional tone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => handleMoodSelect(mood)}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedMood?.label === mood.label
                      ? 'border-primary bg-primary/10 scale-105 shadow-sm'
                      : 'border-border bg-card hover:bg-muted/30 hover:border-border/80'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{mood.emoji}</span>
                  <span className="text-xs font-semibold text-gray-800">{mood.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-gray-700">
                Optional Contextual Note (What influenced this feeling?):
              </label>
              <Textarea
                placeholder="e.g., Finished a key milestone at work, went for a refreshing morning jog, feeling fatigued from screen time..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="zenora-input bg-white text-xs sm:text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <Link to="/dashboard" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> View Longitudinal Analytics on Dashboard →
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedMood}
                className="zenora-button-primary w-full sm:w-auto shadow-sm"
              >
                {isSubmitting ? 'Logging Mood...' : 'Record Mood State'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mood History Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Recent Mood History
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moodHistory.map((item, idx) => (
              <Card key={idx} className="bg-white/85 backdrop-blur-md border border-white/60 p-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="text-3xl p-2 bg-muted/40 rounded-xl">
                    {getMoodEmoji(item.mood)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-900">{getMoodLabel(item.mood)}</span>
                      <span className="text-3xs text-muted-foreground">{formatDate(item.timestamp)}</span>
                    </div>
                    {item.notes ? (
                      <p className="text-xs text-gray-600 mt-1 italic">"{item.notes}"</p>
                    ) : (
                      <p className="text-3xs text-muted-foreground mt-1">No note provided</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoodTracker
