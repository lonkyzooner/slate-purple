import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Eraser as EraseIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Sparkles as SparklesIcon,
  CheckCircle as CheckCircleIcon,
  ClipboardCheck as ClipboardCheckIcon,
  X as XIcon,
  FileText as TemplateIcon,
  Folder as FolderIcon,
  Loader2 as LoaderIcon,
  Trash as TrashIcon,
  XCircle as XCircleIcon
} from 'lucide-react';

interface SavedReport {
  id: string;
  title: string;
  content: string;
  caseNumber?: string;
}

const ReportAssistant: React.FC = () => {
  const [reportText, setReportText] = useState('');
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const clearAll = () => {
    setReportText('');
    setTitle('');
    setFeedback(null);
  };

  const exportReport = () => {
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveReport = () => {
    if (!title.trim() || !reportText.trim()) return;
    const newReport: SavedReport = { id: `${Date.now()}`, title, content: reportText };
    setSavedReports(prev => [...prev, newReport]);
    setTitle('');
    setReportText('');
    setFeedback(null);
  };

  const loadReport = (report: SavedReport) => {
    setTitle(report.title);
    setReportText(report.content);
    setFeedback(null);
  };

  const generateDraft = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'quasar-alpha',
          messages: [
            {
              role: 'user',
              content: 'Generate a detailed, professional police incident report draft based on recent incident data.'
            }
          ]
        }),
      });
      const data = await response.json();
      const generated = data.choices?.[0]?.message?.content;
      setReportText(generated || 'No report generated.');
      setToast({ message: 'Draft generated successfully', type: 'success' });
    } catch (error) {
      console.error('Error generating draft:', error);
      setToast({ message: 'Failed to generate draft', type: 'error' });
    }
    setLoading(false);
  };

  const reviewReport = async () => {
    if (!reportText.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'quasar-alpha',
          messages: [
            {
              role: 'user',
              content: `You are an expert legal writing assistant. Carefully review the following police report and provide a numbered list of specific, actionable suggestions to improve clarity, professionalism, completeness, and grammar. Quote or reference the exact sentence or section, explain why it needs improvement, and provide a concrete suggestion.\n\nReport:\n${reportText}`
            }
          ]
        }),
      });
      const data = await response.json();
      const suggestions = data.choices?.[0]?.message?.content;
      setFeedback(suggestions || 'No suggestions generated.');
      setToast({ message: 'Report reviewed successfully', type: 'success' });
    } catch (error) {
      console.error('Error reviewing report:', error);
      setToast({ message: 'Failed to review report', type: 'error' });
    }
    setLoading(false);
  };

  const loadTemplate = (templateName: string) => {
    if (templateName === 'Incident Report') {
      setReportText('## Incident Information\n\n## Parties Involved\n\n## Narrative\n\n## Actions Taken\n\n## Evidence');
    } else if (templateName === 'Traffic Stop') {
      setReportText('## Stop Details\n\n## Driver Information\n\n## Violations\n\n## Officer Actions\n\n## Outcome');
    } else if (templateName === 'Arrest Report') {
      setReportText('## Arrest Details\n\n## Suspect Information\n\n## Charges\n\n## Evidence\n\n## Officer Statement');
    }
    setTitle(templateName);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Report Assistant</h2>
          <p className="text-gray-400 text-sm">Generate and review professional police reports</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={clearAll}
            variant="outline"
            className="bg-gray-800 hover:bg-gray-700 border-gray-700"
          >
            <EraseIcon className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={exportReport}
            disabled={!reportText.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Report Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Report Title"
                className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={saveReport}
                disabled={loading || !title.trim() || !reportText.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            
            <div className="relative">
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Write or generate your police report here..."
                className="w-full h-[500px] p-4 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  onClick={generateDraft}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Draft'}
                </Button>
                <Button
                  onClick={reviewReport}
                  disabled={loading || !reportText.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  {loading ? 'Reviewing...' : 'Review'}
                </Button>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {feedback && (
            <div className="bg-gray-800 rounded-lg p-4 border border-yellow-600/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-yellow-400 font-semibold flex items-center gap-2">
                  <ClipboardCheckIcon className="h-5 w-5" />
                  AI Review Suggestions
                </h3>
                <Button
                  onClick={() => setFeedback(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-300">
                  {feedback}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Saved Reports & Templates */}
        <div className="space-y-6">
          {/* Templates Section */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TemplateIcon className="h-5 w-5" />
              Templates
            </h3>
            <div className="space-y-2">
              {['Incident Report', 'Traffic Stop', 'Arrest Report'].map((template) => (
                <button
                  key={template}
                  className="w-full text-left px-4 py-3 rounded bg-gray-900 hover:bg-gray-700 transition-colors text-gray-300"
                  onClick={() => loadTemplate(template)}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Reports Section */}
          {savedReports.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FolderIcon className="h-5 w-5" />
                Saved Reports
              </h3>
              <div className="space-y-2">
                {savedReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-700 transition group"
                  >
                    <span className="text-gray-300 truncate flex-1">{report.title}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => loadReport(report)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <LoaderIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setSavedReports(prev => prev.filter(x => x.id !== report.id))}
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <XCircleIcon className="h-5 w-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ReportAssistant;
