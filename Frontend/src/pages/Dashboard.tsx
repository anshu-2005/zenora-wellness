import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { analyticsService, dbService, vitalsService, specialistService } from '@/lib/api'
import FloatingBackground from '@/components/FloatingBackground'
import { ClinicalReportModal } from '@/components/ClinicalReportModal'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import {
  Heart, Sparkles, Wind, Plus, CheckCircle2, Moon, Zap,
  Smile, PhoneCall, Stethoscope, ChevronRight, Check,
  BookOpen, MessageSquare, ArrowRight, ShieldCheck, Activity
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reportView, setReportView] = useState<'weekly' | 'monthly'>('weekly')

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isCheckinOpen, setIsCheckinOpen] = useState(false)
  const [isBreathingOpen, setIsBreathingOpen] = useState(false)
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false)
  const [showCrisisHelp, setShowCrisisHelp] = useState(false)

  // Interactive Quick Check-in state
  const [selectedMood, setSelectedMood] = useState('Calm')
  const [sleepHours, setSleepHours] = useState<number>(7.5)
  const [stressLevel, setStressLevel] = useState<number>(3)
  const [quickNote, setQuickNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Interactive Habit Checkboxes
  const [habits, setHabits] = useState([
    { id: 1, title: 'Morning 5-Min Calm Breathing', done: true },
    { id: 2, title: '7+ Hours Restful Sleep', done: true },
    { id: 3, title: 'Evening Mindful Journal', done: false }
  ])

  // Interactive Doctor Consultation Request state
  const [consultReason, setConsultReason] = useState('Routine Check-in')
  const [consultMessage, setConsultMessage] = useState('')
  const [consultSuccess, setConsultSuccess] = useState(false)

  // 4-7-8 Breathing Orb state
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale')
  const [breathCount, setBreathCount] = useState(4)
  const [isBreathingActive, setIsBreathingActive] = useState(false)

  const loadData = async () => {
    try {
      const res = await analyticsService.getDashboardMetrics(1, 30)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Breathing timer
  useEffect(() => {
    let timer: any
    if (isBreathingActive) {
      if (breathCount > 1) {
        timer = setTimeout(() => setBreathCount(breathCount - 1), 1000)
      } else {
        if (breathingPhase === 'Inhale') {
          setBreathingPhase('Hold')
          setBreathCount(7)
        } else if (breathingPhase === 'Hold') {
          setBreathingPhase('Exhale')
          setBreathCount(8)
        } else {
          setBreathingPhase('Inhale')
          setBreathCount(4)
        }
      }
    }
    return () => clearTimeout(timer)
  }, [isBreathingActive, breathCount, breathingPhase])

  const handleSaveCheckin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await vitalsService.recordVitals({
        user_id: 1,
        sleep_hours: sleepHours,
        stress_level: stressLevel,
        energy_level: 8,
        notes: `Mood: ${selectedMood} | ${quickNote}`
      })
      setIsCheckinOpen(false)
      setQuickNote('')
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await specialistService.requestConsultation({
        user_id: 1,
        reason: consultReason,
        message: consultMessage
      })
      setConsultSuccess(true)
      setTimeout(() => {
        setIsDoctorModalOpen(false)
        setConsultSuccess(false)
        setConsultMessage('')
      }, 2500)
    } catch (err) {
      console.error(err)
    }
  }

  const toggleHabit = (id: number) => {
    setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done } : h))
  }

  const moods = [
    { label: 'Calm', emoji: '🌿', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Happy', emoji: '✨', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Peaceful', emoji: '🕊️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Stressed', emoji: '⚡', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { label: 'Tired', emoji: '🌙', color: 'bg-purple-50 text-purple-700 border-purple-200' }
  ]

  const weeklyData = [
    { week: 'Week 1', score: 42, label: 'Starting Out' },
    { week: 'Week 2', score: 58, label: 'Building Routine' },
    { week: 'Week 3', score: 74, label: 'Noticeable Calm' },
    { week: 'Week 4', score: 88, label: 'Fit & Resilient ✨' }
  ]

  const monthlyTimeline = (data?.timeline || []).slice(-14)

  return (
    <div className="min-h-screen pt-24 pb-28 relative bg-[#FAF9F6]">
      <FloatingBackground />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-7">
        
        {/* Top Header - Friendly, Clean & Non-intimidating */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-slate-500">Live Health Synced</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              Good day, <span className="text-purple-700">{data?.user_name || 'Vikas'}</span> 🌸
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Your mind is resting in a calm space today. Self-care routines are working smoothly.
            </p>
          </div>

          {/* 2 Clean Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsCheckinOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-10 px-4 text-xs font-semibold shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> Quick Check-in
            </Button>
            <Button
              onClick={() => {
                setIsBreathingOpen(true)
                setIsBreathingActive(true)
              }}
              variant="outline"
              className="bg-white/90 border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-700 rounded-2xl h-10 px-4 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all"
            >
              <Wind className="w-4 h-4 text-purple-600" /> 4-7-8 Breathing
            </Button>
          </div>
        </div>

        {/* HERO CARD: Mental Fitness & Recovery Score (Aesthetic & Relaxing) */}
        <div className="bg-linear-to-br from-white via-purple-50/40 to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Left: Overall Status & Doctor Verdict */}
            <div className="space-y-3 text-center md:text-left max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Therapy Process Working • No Doctor Needed
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
                You are recovering naturally and feeling mentally fit.
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Your anxiety and tension have dropped by <strong className="text-emerald-700 font-semibold">71%</strong> over the past month. Your sleep is restful and steady. Routine self-care is all you need right now.
              </p>

              {/* 3 Simple Metrics Pills */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" /> 7.8 hrs Sleep
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Low Stress (3/10)
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" /> 88% Recovery Efficacy
                </span>
              </div>
            </div>

            {/* Right: Circular Aesthetic Recovery Ring */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="56"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="56"
                    stroke="#9333ea"
                    strokeWidth="10"
                    strokeDasharray={351}
                    strokeDashoffset={351 - (351 * 86) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-800">86%</span>
                  <span className="text-2xs font-bold text-purple-700 uppercase tracking-wider">Fit & Stable</span>
                </div>
              </div>
              <p className="text-2xs text-slate-400 mt-2 font-medium">Mental Resilience Score</p>
            </div>
          </div>

          {/* Peaceful doctor check link */}
          <div className="mt-5 pt-4 border-t border-purple-100/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>Attending: <strong>Dr. Meera Sen, MD</strong> (Next scheduled check-in: 6 weeks)</span>
            <button
              onClick={() => setIsDoctorModalOpen(true)}
              className="text-purple-700 hover:text-purple-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              Have a question for the doctor? Message here <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PROGRESS CHARTS: Simple, Beautiful Weekly & Monthly View */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Your Recovery Progress
              </h3>
              <p className="text-xs text-slate-500">
                {reportView === 'weekly'
                  ? 'Consistent improvement week-over-week as you practice mindfulness & healthy sleep.'
                  : 'Daily emotional balance trajectory over the last 14 days.'}
              </p>
            </div>

            {/* Clean 2-Way Tab */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setReportView('weekly')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  reportView === 'weekly' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Weekly Milestones (4 Wks)
              </button>
              <button
                onClick={() => setReportView('monthly')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  reportView === 'monthly' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Daily Timeline (14 Days)
              </button>
            </div>
          </div>

          {/* Smooth Chart */}
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {reportView === 'weekly' ? (
                <BarChart data={weeklyData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                    }}
                    formatter={(val: any) => [`${val}% Wellness`, 'Score']}
                  />
                  <Bar dataKey="score" fill="#9333ea" radius={[10, 10, 4, 4]} />
                </BarChart>
              ) : (
                <AreaChart data={monthlyTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="calmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[-1, 1]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Area type="monotone" dataKey="sentiment" stroke="#9333ea" strokeWidth={2.5} fill="url(#calmGrad)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* 4 Weekly Milestone Cards */}
          {reportView === 'weekly' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              {weeklyData.map((w, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    i === 3
                      ? 'bg-purple-50/70 border-purple-200'
                      : 'bg-slate-50/60 border-slate-100'
                  }`}
                >
                  <p className="text-2xs font-bold text-slate-400 uppercase">{w.week}</p>
                  <p className="text-lg font-extrabold text-slate-800 mt-0.5">{w.score}%</p>
                  <p className="text-2xs font-semibold text-purple-700 mt-1">{w.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2 COMPACT BOTTOM CARDS: Daily Habits & Quick Action Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Today's Gentle Self-Care Habits */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Today's Gentle Habits
              </h4>
              <span className="text-xs text-purple-700 font-semibold">
                {habits.filter(h => h.done).length} of 3 done
              </span>
            </div>

            <div className="space-y-2.5">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                    habit.done
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 line-through opacity-80'
                      : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:border-purple-200'
                  }`}
                >
                  <span>{habit.title}</span>
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center ${habit.done ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                    {habit.done && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Peaceful Shortcuts & Support */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Smile className="w-4 h-4 text-purple-600" />
                Peaceful Shortcuts
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Explore calming tools whenever you need a pause.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link to="/journal">
                <div className="p-3 bg-purple-50/50 hover:bg-purple-50 rounded-2xl border border-purple-100 text-xs font-semibold text-purple-900 flex items-center gap-2 transition-all">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Journal</span>
                </div>
              </Link>

              <Link to="/chat">
                <div className="p-3 bg-blue-50/50 hover:bg-blue-50 rounded-2xl border border-blue-100 text-xs font-semibold text-blue-900 flex items-center gap-2 transition-all">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>AI Friend</span>
                </div>
              </Link>

              <button
                onClick={() => setIsReportOpen(true)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-all text-left"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Summary</span>
              </button>

              <button
                onClick={() => setShowCrisisHelp(!showCrisisHelp)}
                className="p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-100 text-xs font-semibold text-rose-800 flex items-center gap-2 transition-all text-left"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <span>24/7 SOS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Optional 24/7 Helpline Drawer */}
        <AnimatePresence>
          {showCrisisHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 bg-rose-50 rounded-3xl border border-rose-200 text-rose-900 text-xs space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <PhoneCall className="w-4 h-4 text-rose-600" /> Free 24/7 Helplines
              </div>
              <p>Need someone confidential to talk to right now?</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <span className="font-bold">Tele-MANAS: 14416</span> • <span className="font-bold">Vandrevala: +91 9999 666 555</span> • <span className="font-bold">US/Global: 988</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SIMPLE QUICK CHECK-IN (3 SLIDERS + MOOD)                         */}
      {/* ========================================================================= */}
      <Dialog open={isCheckinOpen} onOpenChange={setIsCheckinOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Smile className="w-5 h-5 text-purple-600" /> Quick Daily Check-in
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              A 15-second pause to record your state and keep your recovery chart updated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCheckin} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">How are you feeling right now?</label>
              <div className="grid grid-cols-5 gap-1.5">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMood(m.label)}
                    className={`py-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      selectedMood === m.label
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : `${m.color}`
                    }`}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span className="text-2xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-700 flex items-center gap-1"><Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep</span>
                <span className="text-purple-700">{sleepHours} Hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-700 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Stress Level</span>
                <span className="text-purple-700">{stressLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">One-line Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Took a relaxing morning walk..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCheckinOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold">
                {isSubmitting ? 'Saving...' : 'Save Check-in'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: 4-7-8 CALMING BREATHING ORB                                      */}
      {/* ========================================================================= */}
      <Dialog open={isBreathingOpen} onOpenChange={setIsBreathingOpen}>
        <DialogContent className="sm:max-w-md bg-linear-to-b from-purple-900 to-slate-900 text-white rounded-3xl p-6 border-0 shadow-2xl text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Wind className="w-5 h-5 text-emerald-400" /> 4-7-8 Calming Breath
            </DialogTitle>
            <DialogDescription className="text-xs text-purple-200">
              Softly downregulate anxiety and ground your nervous system.
            </DialogDescription>
          </DialogHeader>

          <div className="py-8 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: breathingPhase === 'Inhale' ? 1.35 : breathingPhase === 'Hold' ? 1.35 : 0.9,
                boxShadow: breathingPhase === 'Inhale'
                  ? '0 0 50px rgba(168, 85, 247, 0.6)'
                  : breathingPhase === 'Hold'
                  ? '0 0 60px rgba(52, 211, 153, 0.7)'
                  : '0 0 20px rgba(147, 197, 253, 0.3)'
              }}
              transition={{
                duration: breathingPhase === 'Inhale' ? 4 : breathingPhase === 'Hold' ? 7 : 8,
                ease: 'easeInOut'
              }}
              className="w-32 h-32 rounded-full bg-linear-to-tr from-purple-500 via-indigo-500 to-emerald-400 flex flex-col items-center justify-center text-white font-extrabold text-3xl shadow-lg border-2 border-white/30"
            >
              <span>{breathCount}</span>
              <span className="text-2xs font-normal opacity-80 uppercase tracking-widest mt-0.5">Sec</span>
            </motion.div>

            <h4 className="text-lg font-bold text-white mt-6">
              {breathingPhase === 'Inhale' && 'Inhale gently through nose...'}
              {breathingPhase === 'Hold' && 'Hold breath softly...'}
              {breathingPhase === 'Exhale' && 'Exhale slowly through mouth...'}
            </h4>
          </div>

          <DialogFooter className="flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs"
            >
              {isBreathingActive ? 'Pause' : 'Resume'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsBreathingOpen(false)
                setIsBreathingActive(false)
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: SIMPLE DOCTOR CONSULTATION REQUEST                               */}
      {/* ========================================================================= */}
      <Dialog open={isDoctorModalOpen} onOpenChange={setIsDoctorModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" /> Message Dr. Meera Sen
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Have a question about your progress or care plan? Send a direct note to your doctor.
            </DialogDescription>
          </DialogHeader>

          {consultSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl text-center my-2 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-emerald-900 text-sm">Note Sent Successfully!</p>
              <p className="text-xs text-emerald-700 mt-1">Dr. Meera Sen will review your chart during clinic hours.</p>
            </div>
          ) : (
            <form onSubmit={handleConsultSubmit} className="space-y-3.5 mt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason</label>
                <select
                  value={consultReason}
                  onChange={(e) => setConsultReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Routine Check-in">Routine Progress Check-in</option>
                  <option value="Sleep or Stress Question">Sleep or Stress Question</option>
                  <option value="Schedule Next Appointment">Schedule Next Appointment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Question or Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Hello Doctor, I've been sleeping well but had a quick question..."
                  value={consultMessage}
                  onChange={(e) => setConsultMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDoctorModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold">
                  Send to Doctor
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Clinical Report Export Modal */}
      <ClinicalReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  )
}

export default Dashboard
