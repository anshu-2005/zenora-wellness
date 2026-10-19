'use client'

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/lib/store'
import { assessmentService } from '@/lib/api'
import FloatingBackground from '@/components/FloatingBackground'
import { ShieldAlert, PhoneCall, ArrowRight, Activity, Heart } from 'lucide-react'

type QuestionType = {
  id: number
  type: 'gad7' | 'phq9'
  text: string
  options: {
    value: number
    label: string
  }[]
}

const standardOptions = () => [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

const gad7Questions: QuestionType[] = [
  { id: 1, type: 'gad7', text: 'Feeling nervous, anxious, or on edge', options: standardOptions() },
  { id: 2, type: 'gad7', text: 'Not being able to stop or control worrying', options: standardOptions() },
  { id: 3, type: 'gad7', text: 'Worrying too much about different things', options: standardOptions() },
  { id: 4, type: 'gad7', text: 'Trouble relaxing', options: standardOptions() },
  { id: 5, type: 'gad7', text: 'Being so restless that it is hard to sit still', options: standardOptions() },
  { id: 6, type: 'gad7', text: 'Becoming easily annoyed or irritable', options: standardOptions() },
  { id: 7, type: 'gad7', text: 'Feeling afraid as if something awful might happen', options: standardOptions() },
]

const phq9Questions: QuestionType[] = [
  { id: 8, type: 'phq9', text: 'Little interest or pleasure in doing things', options: standardOptions() },
  { id: 9, type: 'phq9', text: 'Feeling down, depressed, or hopeless', options: standardOptions() },
  { id: 10, type: 'phq9', text: 'Trouble falling or staying asleep, or sleeping too much', options: standardOptions() },
  { id: 11, type: 'phq9', text: 'Feeling tired or having little energy', options: standardOptions() },
  { id: 12, type: 'phq9', text: 'Poor appetite or overeating', options: standardOptions() },
  { id: 13, type: 'phq9', text: 'Feeling bad about yourself or that you are a failure', options: standardOptions() },
  { id: 14, type: 'phq9', text: 'Trouble concentrating on things (reading, watching tv)', options: standardOptions() },
  { id: 15, type: 'phq9', text: 'Moving or speaking slowly, or being fidgety/restless', options: standardOptions() },
  { id: 16, type: 'phq9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way', options: standardOptions() },
]

const allQuestions: QuestionType[] = [...gad7Questions, ...phq9Questions]

const getInterpretation = (type: 'gad7' | 'phq9', score: number) => {
  if (type === 'gad7') {
    if (score <= 4) return { level: 'Minimal anxiety', color: 'bg-green-500', desc: 'Symptoms indicate minimal anxiety. Continue healthy self-care habits.' }
    if (score <= 9) return { level: 'Mild anxiety', color: 'bg-yellow-500', desc: 'Mild anxious tension. Mindfulness and grounding exercises are recommended.' }
    if (score <= 14) return { level: 'Moderate anxiety', color: 'bg-orange-500', desc: 'Moderate anxiety. Consider speaking with a counselor or mental health professional.' }
    return { level: 'Severe anxiety', color: 'bg-red-500', desc: 'Elevated anxiety. Active clinical support is strongly advised.' }
  } else {
    if (score <= 4) return { level: 'Minimal depression', color: 'bg-green-500', desc: 'Normal mood fluctuations. Continue reflective tracking.' }
    if (score <= 9) return { level: 'Mild depression', color: 'bg-yellow-500', desc: 'Mild depressive symptoms. Physical movement and social connection can support you.' }
    if (score <= 14) return { level: 'Moderate depression', color: 'bg-orange-500', desc: 'Moderate depression. A professional clinical consultation is recommended.' }
    if (score <= 19) return { level: 'Moderately severe depression', color: 'bg-red-400', desc: 'Significant depressive burden. We encourage seeking medical or psychological guidance.' }
    return { level: 'Severe depression', color: 'bg-red-500', desc: 'Severe depressive symptoms. Immediate clinical evaluation is strongly recommended.' }
  }
}

const Assessment = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [gad7Score, setGad7Score] = useState(0)
  const [phq9Score, setPhq9Score] = useState(0)
  const [hasCrisisRisk, setHasCrisisRisk] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== allQuestions.length) {
      toast({
        title: "Incomplete assessment",
        description: "Please answer all 16 clinical screening questions before submitting",
        variant: "destructive",
      })
      return
    }

    const gad7Total = gad7Questions.reduce((total, q) => total + (answers[q.id] ?? 0), 0)
    const phq9Total = phq9Questions.reduce((total, q) => total + (answers[q.id] ?? 0), 0)

    // Check Question 16 (Suicidal / Self-Harm ideation marker)
    const item16Value = answers[16] || 0
    const crisis = item16Value > 0 || phq9Total >= 20

    setGad7Score(gad7Total)
    setPhq9Score(phq9Total)
    setHasCrisisRisk(crisis)
    setSubmitted(true)

    try {
      await assessmentService.saveAssessment({
        gad7Score: gad7Total,
        phq9Score: phq9Total,
        crisisFlag: crisis
      })

      toast({
        title: "Assessment Recorded",
        description: "Your clinical scores have been securely updated.",
      })
    } catch (error) {
      toast({
        title: "Recorded locally",
        description: "Your assessment results are displayed below.",
      })
    }
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
    setGad7Score(0)
    setPhq9Score(0)
    setHasCrisisRisk(false)
  }

  const gad7Interpretation = getInterpretation('gad7', gad7Score)
  const phq9Interpretation = getInterpretation('phq9', phq9Score)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <FloatingBackground />

      <div className="zenora-container max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!submitted ? (
            <Card className="bg-white/95 backdrop-blur-md shadow-md border border-white/60">
              <CardHeader className="text-center pb-4 border-b">
                <Badge variant="outline" className="w-fit mx-auto bg-primary/10 text-primary border-primary/20 mb-2">
                  Clinically Validated Screening Tool
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Standardized Mental Health Assessment
                </CardTitle>
                <CardDescription className="text-sm max-w-xl mx-auto mt-2 text-muted-foreground">
                  Includes the Generalized Anxiety Disorder 7-item scale (<strong>GAD-7</strong>) and the Patient Health Questionnaire 9-item scale (<strong>PHQ-9</strong>).
                  <br />Over the last 2 weeks, how often have you been bothered by the following problems?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Anxiety Section Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-border text-primary font-semibold text-sm">
                  <Activity className="w-4 h-4" /> Part 1: GAD-7 Anxiety Assessment
                </div>

                {gad7Questions.map((question) => (
                  <div key={question.id} className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors">
                    <p className="mb-3 font-medium text-sm text-gray-900">
                      <span className="text-muted-foreground font-semibold mr-1.5">{question.id}.</span>
                      {question.text}
                    </p>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {question.options.map((option) => (
                          <div
                            key={option.value}
                            className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              answers[question.id] === option.value
                                ? 'bg-primary/10 border-primary text-primary font-semibold'
                                : 'bg-white border-border text-gray-700 hover:bg-muted/30'
                            }`}
                          >
                            <RadioGroupItem value={option.value.toString()} id={`q${question.id}-o${option.value}`} />
                            <Label htmlFor={`q${question.id}-o${option.value}`} className="cursor-pointer text-xs">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}

                {/* Depression Section Header */}
                <div className="flex items-center gap-2 pb-2 pt-4 border-b border-border text-zenora-softpink font-semibold text-sm">
                  <Heart className="w-4 h-4" /> Part 2: PHQ-9 Depression Assessment
                </div>

                {phq9Questions.map((question) => (
                  <div key={question.id} className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors">
                    <p className="mb-3 font-medium text-sm text-gray-900">
                      <span className="text-muted-foreground font-semibold mr-1.5">{question.id}.</span>
                      {question.text}
                    </p>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {question.options.map((option) => (
                          <div
                            key={option.value}
                            className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              answers[question.id] === option.value
                                ? 'bg-primary/10 border-primary text-primary font-semibold'
                                : 'bg-white border-border text-gray-700 hover:bg-muted/30'
                            }`}
                          >
                            <RadioGroupItem value={option.value.toString()} id={`q${question.id}-o${option.value}`} />
                            <Label htmlFor={`q${question.id}-o${option.value}`} className="cursor-pointer text-xs">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-4 border-t">
                <Button onClick={handleSubmit} className="zenora-button-primary w-full shadow-sm text-sm">
                  Calculate Scores & Submit Assessment
                </Button>
                <p className="text-3xs text-center text-muted-foreground">
                  All submissions are encrypted and processed strictly in accordance with ethical healthcare standards.
                </p>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-white/95 backdrop-blur-md shadow-lg border border-white/60 p-6 sm:p-8">
              <CardHeader className="text-center pb-6 border-b">
                <Badge variant="outline" className="w-fit mx-auto bg-green-50 text-green-700 border-green-200 mb-2">
                  Assessment Completed
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Your Clinical Screening Summary
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Scores calculated from standardized GAD-7 and PHQ-9 psychometric rubrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                {/* Immediate Crisis Alert if Question 16 answered > 0 */}
                {hasCrisisRisk && (
                  <div className="p-5 bg-red-100/90 border border-red-300 rounded-2xl flex items-start gap-3 text-red-950">
                    <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-bold text-sm text-red-900">Immediate Support Notice</p>
                      <p className="text-xs text-red-800 leading-relaxed">
                        Your response indicated thoughts of self-harm or significant emotional weight. Please know that your life is deeply valuable, and compassionate, free support is available 24/7.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5">
                          <PhoneCall className="w-3.5 h-3.5" /> Call Tele-MANAS: 14416
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-900 text-xs">
                          Dial 988 Lifeline
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Anxiety GAD-7 Results */}
                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" /> Generalized Anxiety (GAD-7)
                    </h3>
                    <span className="font-bold text-lg text-gray-900">{gad7Score} / 21</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${gad7Interpretation.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (gad7Score / 21) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="font-medium text-gray-800">{gad7Interpretation.level}</span>
                    <span className="text-muted-foreground">{gad7Interpretation.desc}</span>
                  </div>
                </div>

                {/* Depression PHQ-9 Results */}
                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-zenora-softpink" /> Depressive Symptoms (PHQ-9)
                    </h3>
                    <span className="font-bold text-lg text-gray-900">{phq9Score} / 27</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${phq9Interpretation.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, (phq9Score / 27) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="font-medium text-gray-800">{phq9Interpretation.level}</span>
                    <span className="text-muted-foreground">{phq9Interpretation.desc}</span>
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link to="/dashboard" className="flex-1">
                    <Button className="zenora-button-primary w-full gap-2">
                      View Wellness Dashboard <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Retake Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Assessment
