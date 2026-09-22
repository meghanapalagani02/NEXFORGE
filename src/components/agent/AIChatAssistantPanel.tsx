import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';
import {
  AgentChatMessage
} from '../../types/planning';
import {
  AgentProductionPlanResult,
  PlanningAgentInputState
} from '../../types/agentPlanning';
import { answerManufacturingQuery } from '../../utils/agentCalculations';
import { useReadAloud } from '../../hooks/useReadAloud';
import { formatUnits } from '../../data/planningData';

interface AIChatAssistantPanelProps {
  planResult: AgentProductionPlanResult;
  inputs: PlanningAgentInputState;
}

const CANNED_MANUFACTURING_QUESTIONS = [
  'Explain my current plan',
  'Show inventory risks',
  'Explain the forecast',
  'Why is production recommended at this level?',
  'What changes if demand increases by 20%?',
  'Which planning constraint is most important?',
  'Why is production increased?',
  'Why do I need additional inventory?',
  'What is causing the capacity constraint?'
];

export const AIChatAssistantPanel: React.FC<AIChatAssistantPanelProps> = ({
  planResult,
  inputs
}) => {
  const readAloud = useReadAloud();
  const [showSpeedControls, setShowSpeedControls] = useState<boolean>(false);

  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Hello, I am your Nexforge AI Production Planning Assistant. I have analyzed the demand forecasts, inventory levels, and factory floor constraints for ${planResult.product.productName}. You can ask questions about the production schedule, capacity limits, or material requirements below.`,
      timestamp: 'Live',
      category: 'welcome',
      keyStats: [
        { label: 'Demand', value: `${(planResult.executiveSummary.totalForecastDemand / 1000).toFixed(1)}k` },
        { label: 'Output', value: `${(planResult.executiveSummary.totalRecommendedProduction / 1000).toFixed(1)}k` },
        { label: 'Feasibility', value: planResult.executiveSummary.isFeasible ? '100%' : 'Constrained', status: 'positive' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isThinking) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const response = answerManufacturingQuery(q, planResult, inputs);
      const agentMsgId = `agent-${Date.now()}`;
      const agentMsg: AgentChatMessage = {
        id: agentMsgId,
        sender: 'agent',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        takeaway: response.takeaway,
        keyStats: response.keyStats
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsThinking(false);
    }, 450);
  };

  return (
    <div className="bg-white border border-orange-200 shadow-2xs rounded-xl flex flex-col h-[540px] font-mono text-xs overflow-hidden relative">
      {/* Header */}
      <div className="p-3.5 bg-orange-50/80 border-b border-orange-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-none flex items-center gap-1.5">
              <span>AI Planning Assistant</span>
              {readAloud.isSpeaking && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                  <Volume2 className="w-2.5 h-2.5" />
                  Reading Aloud
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-sans">
              Decision intelligence for {planResult.product.productName}
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {/* Read Aloud Speed Menu Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpeedControls(!showSpeedControls)}
              className="px-2 py-1 bg-white hover:bg-orange-100 text-slate-700 rounded-md border border-orange-200 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Read Aloud Audio Speed"
            >
              <Sliders className="w-3 h-3 text-orange-600" />
              <span>Speed: {readAloud.speechRate}x</span>
            </button>

            {showSpeedControls && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-orange-200 rounded-lg shadow-lg p-1.5 z-20 flex gap-1">
                {[0.85, 1.0, 1.2, 1.4].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      readAloud.setSpeechRate(rate);
                      setShowSpeedControls(false);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer ${
                      readAloud.speechRate === rate
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-orange-50'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Chat */}
          <button
            type="button"
            onClick={() => {
              if (readAloud.isSpeaking) readAloud.stop();
              setMessages([
                {
                  id: 'welcome',
                  sender: 'agent',
                  text: 'Chat reset. Ready for demand, inventory, capacity, or risk queries.',
                  timestamp: 'Live'
                }
              ]);
            }}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-orange-100 transition-colors cursor-pointer border border-transparent hover:border-orange-200"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current Planning Summary Strip */}
      <div className="px-3.5 py-2 bg-orange-50/60 border-b border-orange-200/80 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono scrollbar-none">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Context:</span>
          <span>Demand: <strong className="text-slate-900">{formatUnits(planResult.executiveSummary.totalForecastDemand)}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Output: <strong className="text-orange-700">{formatUnits(planResult.executiveSummary.totalRecommendedProduction)}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Inventory: <strong className="text-slate-900">{formatUnits(inputs.inventory.currentInventory)}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Safety Buffer: <strong className="text-slate-900">{formatUnits(inputs.inventory.safetyStock)}</strong></span>
          <span className="text-slate-300">|</span>
          <span>Avg Line Load: <strong className="text-slate-900">{planResult.executiveSummary.averageCapacityUtilization}%</strong></span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
          planResult.executiveSummary.isFeasible
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {planResult.executiveSummary.isFeasible ? 'Plan Validated' : 'Constrained'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          const isSpeakingThis = readAloud.isSpeaking && readAloud.speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              {isAgent && (
                <div className="w-6 h-6 rounded bg-orange-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3 space-y-2 relative transition-all ${
                  isAgent
                    ? isSpeakingThis
                      ? 'bg-white border-2 border-emerald-400 text-slate-800 shadow-md ring-2 ring-emerald-100'
                      : 'bg-white border border-orange-200 text-slate-800 shadow-2xs'
                    : 'bg-orange-600 text-white shadow-2xs'
                }`}
              >
                {/* Agent Card Header with Read Aloud Button */}
                {isAgent && (
                  <div className="flex items-center justify-between border-b border-orange-100 pb-1 text-[10px] text-slate-400">
                    <span className="font-bold text-orange-800 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Plan Recommendation
                    </span>
                    <button
                      type="button"
                      onClick={() => readAloud.toggle(msg.text, msg.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                        isSpeakingThis
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-orange-50 text-slate-700 hover:text-slate-900 border-orange-200 hover:bg-orange-100'
                      }`}
                      title="Read out aloud"
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3 h-3 text-emerald-700" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-orange-700" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-line leading-relaxed font-sans text-xs">
                  {msg.text}
                </div>

                {/* Key stats if any */}
                {msg.keyStats && msg.keyStats.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1.5 border-t border-orange-100 font-mono text-[10px]">
                    {msg.keyStats.map((st, i) => (
                      <div key={i} className="p-1 bg-orange-50/60 rounded border border-orange-100">
                        <span className="text-slate-400 block truncate">{st.label}</span>
                        <span className="font-bold text-slate-900">{st.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.takeaway && (
                  <div className="text-[10px] text-orange-800 bg-orange-50 p-1.5 rounded font-mono font-semibold">
                    💡 {msg.takeaway}
                  </div>
                )}
              </div>

              {!isAgent && (
                <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-2.5 items-center text-slate-500 text-[11px] font-mono p-2 bg-orange-50/50 rounded-lg border border-orange-200">
            <div className="w-5 h-5 rounded bg-orange-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 animate-spin" />
            </div>
            <span>Evaluating shop floor constraints & generating plan answer...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-3 py-2 bg-white border-t border-orange-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[9px] font-bold uppercase text-slate-400 shrink-0">Ask:</span>
        {CANNED_MANUFACTURING_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-950 rounded text-[10px] whitespace-nowrap border border-orange-200 cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-orange-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask manufacturing planning questions (capacity, demand, materials)..."
          className="flex-1 bg-slate-50 border border-orange-200 rounded-lg px-3 py-2 text-slate-900 text-xs font-sans focus:ring-1 focus:ring-orange-500 focus:bg-white outline-none"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isThinking}
          className="p-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
