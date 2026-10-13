import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { generateDeterministicAnswer, AskSmartFlowContext } from '../../utils/fallbackAi';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini_api' | 'deterministic_engine';
  confidenceNotice?: string;
  citedMetrics?: { label: string; value: string }[];
}

export const AiAssistantView: React.FC = () => {
  const {
    beds,
    patients,
    diagnostics,
    recommendations,
    alerts,
    activeBottlenecks,
    overallOccupancyPercent,
    availableBedsCount,
    totalBedsCount,
    avgWaitTimeMinutes
  } = useHospital();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Hello, I am **SmartFlow AI Assistant**. I provide real-time operational intelligence grounded in your hospital's active bed census, patient queues, statistical arrival forecasts, and bottleneck engines.

You can ask me questions about unit capacity, bottlenecks, what-if scenarios, and recommended administrative workflows.`,
      timestamp: 'Just now',
      source: 'deterministic_engine',
      confidenceNotice: 'Grounded in live St. Jude Academic Medical Center operational census.'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const presetQueries = [
    'Which department is most likely to become overcrowded?',
    'How many beds are available in the medical ward?',
    'What is causing the largest operational bottleneck?',
    'What happens if patient arrivals increase by 20%?',
    'Which resources are underutilized?',
    'What actions should administrators review first?'
  ];

  // Context snapshot for the engine
  const contextSnapshot: AskSmartFlowContext = {
    beds,
    patients,
    diagnostics,
    recommendations,
    alerts,
    bottlenecks: activeBottlenecks,
    overallOccupancyPercent,
    availableBedsCount,
    totalBedsCount,
    avgWaitTimeMinutes
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    setInputQuery('');

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 1. Try secure backend route with Gemini API
      const response = await fetch('/api/ask-smartflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          hospitalSnapshot: {
            occupancy: `${overallOccupancyPercent}%`,
            availableBeds: availableBedsCount,
            totalBeds: totalBedsCount,
            avgWaitTimeMinutes,
            bottlenecksCount: activeBottlenecks.length,
            topBottlenecks: activeBottlenecks.map(b => `${b.stageName} (${b.severity}): ${b.triggerMeasurement}`),
            activeAlerts: alerts.filter(a => a.status === 'active').map(a => a.title),
            bedCounts: {
              ed: beds.filter(b => b.departmentId === 'ed' && b.status === 'available').length,
              icu: beds.filter(b => b.departmentId === 'icu' && b.status === 'available').length,
              med_surg: beds.filter(b => b.departmentId === 'med_surg' && b.status === 'available').length,
              surgical: beds.filter(b => b.departmentId === 'surgical' && b.status === 'available').length,
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.source === 'gemini_api' && data.text) {
          setMessages(prev => [
            ...prev,
            {
              id: `asst-${Date.now()}`,
              sender: 'assistant',
              text: data.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: 'gemini_api',
              confidenceNotice: data.confidenceNotice || 'Generated via Gemini 2.5 Flash.'
            }
          ]);
          setIsLoading(false);
          return;
        }
      }

      // If backend reports no API key or returns error, use deterministic fallback engine
      throw new Error('Fallback needed');
    } catch (err) {
      // Fallback deterministic engine
      const answer = generateDeterministicAnswer(textToSend, contextSnapshot);
      setMessages(prev => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: answer.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'deterministic_engine',
          confidenceNotice: answer.confidenceNotice,
          citedMetrics: answer.citedMetrics
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Ask SmartFlow AI Assistant
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Operational Q&A
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Natural-language hospital inquiries grounded strictly in verified bed availability, queue metrics, and forecasts
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Non-clinical decision support · Strict ground-truth metric citation</span>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Suggested Inquiries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presetQueries.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pq)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200/80 hover:border-blue-200 font-medium transition-all text-left disabled:opacity-50"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4.5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs space-y-2 leading-relaxed ${
                    isUser
                      ? 'bg-blue-700 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Cited Metrics Tags */}
                  {msg.citedMetrics && msg.citedMetrics.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2">
                      {msg.citedMetrics.map((cm, i) => (
                        <div
                          key={i}
                          className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                        >
                          <span className="text-slate-500">{cm.label}:</span>{' '}
                          <span className="font-bold text-slate-900">{cm.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Confidence / Source Badge */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        {msg.source === 'gemini_api' ? (
                          <>
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>Gemini 2.5 Flash</span>
                          </>
                        ) : (
                          <>
                            <Cpu className="w-3 h-3 text-blue-600" />
                            <span>Verified Operational Engine</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Synthesizing live hospital telemetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about hospital bottlenecks, bed capacity, arrival forecasts, or what-if impacts..."
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
