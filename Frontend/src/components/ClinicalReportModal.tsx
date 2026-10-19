import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { reportService } from '@/lib/api'
import { Printer, Download, ShieldCheck, AlertTriangle, FileText } from 'lucide-react'

interface ClinicalReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      reportService.getClinicalReport().then((data) => {
        setReport(data)
        setLoading(false)
      })
    }
  }, [isOpen])

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl print:p-0 print:max-h-none print:shadow-none print:border-none">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">
                Clinical Mental Health Analytics
              </span>
              <DialogTitle className="text-2xl font-bold mt-2 text-gray-900">
                ZENORA Patient Wellness & Sentiment Summary Report
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Report Identifier: {report?.report_id || 'Generating...'} | Generated on {report?.generated_at}
              </DialogDescription>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" /> Print / PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            Compiling clinical assessment metrics and NLP sentiment trends...
          </div>
        ) : report ? (
          <div className="space-y-6 text-gray-800 text-sm print:text-black">
            {/* Patient Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
              <div>
                <p className="text-xs font-medium text-gray-500">Patient Name</p>
                <p className="font-semibold text-gray-900">{report.patient.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Contact Email</p>
                <p className="font-semibold text-gray-900">{report.patient.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Age / Gender</p>
                <p className="font-semibold text-gray-900">{report.patient.age || '23'} / {report.patient.gender || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Risk Stratification</p>
                <span className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-full ${
                  report.clinical_metrics.risk_stratification.includes('Elevated')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {report.clinical_metrics.risk_stratification}
                </span>
              </div>
            </div>

            {/* Core Psychometric & Sentiment Metrics */}
            <div>
              <h4 className="font-semibold text-base mb-3 flex items-center gap-2 text-gray-900">
                <FileText className="w-4 h-4 text-primary" /> Key Diagnostic & NLP Analytics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 border rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground">Latest GAD-7 (Anxiety)</p>
                  <p className="text-2xl font-bold text-gray-900">{report.clinical_metrics.latest_gad7_score} / 21</p>
                  <p className="text-xs text-gray-500">
                    {report.clinical_metrics.latest_gad7_score <= 4 ? 'Minimal Anxiety' : report.clinical_metrics.latest_gad7_score <= 9 ? 'Mild Anxiety' : 'Elevated Anxiety'}
                  </p>
                </div>
                <div className="p-3 border rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground">Latest PHQ-9 (Depression)</p>
                  <p className="text-2xl font-bold text-gray-900">{report.clinical_metrics.latest_phq9_score} / 27</p>
                  <p className="text-xs text-gray-500">
                    {report.clinical_metrics.latest_phq9_score <= 4 ? 'Minimal Depression' : report.clinical_metrics.latest_phq9_score <= 9 ? 'Mild Depression' : 'Elevated Depression'}
                  </p>
                </div>
                <div className="p-3 border rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground">VADER Sentiment Polarity</p>
                  <p className="text-2xl font-bold text-primary">
                    {report.clinical_metrics.average_nlp_sentiment_score > 0 ? '+' : ''}
                    {report.clinical_metrics.average_nlp_sentiment_score}
                  </p>
                  <p className="text-xs text-gray-500">Scale: -1.0 (Distressed) to +1.0 (Positive)</p>
                </div>
                <div className="p-3 border rounded-xl bg-card">
                  <p className="text-xs text-muted-foreground">Reflection Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">{report.clinical_metrics.total_journal_entries} Entries</p>
                  <p className="text-xs text-gray-500">{report.clinical_metrics.total_mood_logs} Mood Track Logs</p>
                </div>
              </div>
            </div>

            {/* Assessment History Table */}
            <div>
              <h4 className="font-semibold text-base mb-2 text-gray-900">Standardized Assessment History</h4>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">GAD-7 (Anxiety)</th>
                      <th className="p-2.5">PHQ-9 (Depression)</th>
                      <th className="p-2.5">Clinical Classification</th>
                      <th className="p-2.5">Safety Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.recent_assessments?.map((a: any, i: number) => (
                      <tr key={i} className="hover:bg-muted/20">
                        <td className="p-2.5 font-medium">{a.date}</td>
                        <td className="p-2.5">{a.gad7} / 21</td>
                        <td className="p-2.5">{a.phq9} / 27</td>
                        <td className="p-2.5">{a.interpretation || 'Evaluated'}</td>
                        <td className="p-2.5">
                          {a.crisis_flag ? (
                            <span className="text-red-600 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Flagged
                            </span>
                          ) : (
                            <span className="text-green-600 font-medium">Standard</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Reflections & NLP Sentiment */}
            <div>
              <h4 className="font-semibold text-base mb-2 text-gray-900">Recent Reflections & Emotion Categorization</h4>
              <div className="space-y-2">
                {report.recent_sentiments?.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-xl flex justify-between items-center bg-card">
                    <div>
                      <p className="font-medium text-gray-900">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.date} • Tags: {s.tags?.join(', ') || 'Reflection'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.sentiment_label === 'Positive'
                          ? 'bg-green-100 text-green-800'
                          : s.sentiment_label === 'Negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {s.sentiment_label} ({s.score > 0 ? '+' : ''}{s.score})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory & Clinical Disclaimer */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
              <p className="font-bold mb-1 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Clinical Notice & Scope of Application:
              </p>
              <p>{report.disclaimer}</p>
              <p className="mt-1 text-gray-600">
                In acute distress, contact the 24/7 National Suicide and Crisis Lifeline by dialing <strong>988</strong> or Tele-MANAS at <strong>14416</strong>.
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
