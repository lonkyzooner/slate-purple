import React, { useState } from 'react';

interface SavedReport {
  id: string;
  title: string;
  content: string;
}

const ReportAssistant: React.FC = () => {
  const [reportText, setReportText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [title, setTitle] = useState('');

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
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid JSON response from server.');
      }
      const generated = data.choices?.[0]?.message?.content;
      setReportText(generated || 'No report generated.');
    } catch (error) {
      console.error('Error generating draft:', error);
      setFeedback('Error generating draft: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Invalid JSON response from server.');
      }
      const suggestions = data.choices?.[0]?.message?.content;
      setFeedback(suggestions || 'No suggestions generated.');
    } catch (error) {
      console.error('Error reviewing report:', error);
      setFeedback('Error reviewing report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setLoading(false);
  };

  const clearAll = () => {
    setReportText('');
    setFeedback(null);
    setTitle('');
  };

  const saveReport = () => {
    if (!title.trim() || !reportText.trim()) return;
    const newReport = { id: `${Date.now()}`, title, content: reportText };
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

  const exportReport = () => {
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-2">Lark Report Assistant</h2>
      <p className="text-gray-400 mb-4">Generate, review, save, and export police reports with AI assistance.</p>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">Report Details</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Report Title"
            className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={saveReport}
              disabled={loading || !title.trim() || !reportText.trim()}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 transition"
            >
              Save
            </button>
            <button
              onClick={exportReport}
              disabled={!reportText.trim()}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition"
            >
              Export
            </button>
            <button
              onClick={clearAll}
              disabled={loading}
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">Report Content</h3>
        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="Write or generate your police report here..."
          className="w-full h-64 p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-4">
          <button
            onClick={generateDraft}
            disabled={loading}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition"
          >
            {loading ? 'Generating...' : 'Generate Draft'}
          </button>
          <button
            onClick={reviewReport}
            disabled={loading || !reportText.trim()}
            className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 transition"
          >
            {loading ? 'Reviewing...' : 'Review Report'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-lg bg-gray-800 border border-yellow-600 whitespace-pre-wrap shadow-inner">
          <h3 className="font-semibold mb-2 text-yellow-400">AI Suggestions</h3>
          <p>{feedback}</p>
        </div>
      )}

      {savedReports.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">Saved Reports</h3>
          <ul className="space-y-2">
            {savedReports.map((r) => (
              <li key={r.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition">
                <span className="truncate">{r.title}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadReport(r)}
                    className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 text-sm transition"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => setSavedReports(prev => prev.filter(x => x.id !== r.id))}
                    className="px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportAssistant;
