import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { ReasoningModal } from './components/ReasoningModal';
import { FileUploadModal } from './components/FileUploadModal';
import { ToastNotification, ToastData } from './components/Toast';
import { NexforgeIntro } from './components/NexforgeIntro';
import { NexforgeLogo } from './components/NexforgeLogo';
import { OverviewView } from './pages/OverviewView';
import { ForecastView } from './pages/ForecastView';
import { InventoryView } from './pages/InventoryView';
import { ProductionView } from './pages/ProductionView';
import { ProductionPlanningPage } from './pages/ProductionPlanningPage';
import { ProductionSchedulingPage } from './pages/ProductionSchedulingPage';
import { QuantumOptimizationPage } from './pages/QuantumOptimizationPage';
import { ScenarioView } from './pages/ScenarioView';
import { AgentView } from './pages/AgentView';
import {
  INITIAL_SUMMARY,
  BASELINE_MONTHLY_PLAN,
  HISTORICAL_DEMAND_SERIES,
  formatUnits
} from './data/planningData';
import { parseUploadedFile, ImportResult } from './utils/fileParser';
import {
  ActiveTab,
  PlanningSummary,
  MonthlyPlanItem,
  HistoricalDemandPoint,
  ProductConfig,
  BackendConnectionStatus
} from './types/planning';
import { planningApi } from './services/planningApi';
import { UserProfile } from './types/auth';
import { Menu, X, Upload } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('nexforge_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isWhyThisPlanOpen, setIsWhyThisPlanOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [pendingAgentQuery, setPendingAgentQuery] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('nexforge_user', JSON.stringify(user));
    } catch {}
    setToast({
      id: String(Date.now()),
      type: 'success',
      title: `Welcome back, ${user.name}`,
      message: `Signed in as ${user.role} (${user.email}). Planning session active.`,
      duration: 4000
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('nexforge_user');
    } catch {}
  };

  // Dynamic Application State
  const [summary, setSummary] = useState<PlanningSummary>(INITIAL_SUMMARY);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlanItem[]>(BASELINE_MONTHLY_PLAN);
  const [historicalDemand, setHistoricalDemand] =
    useState<HistoricalDemandPoint[]>(HISTORICAL_DEMAND_SERIES);

  // Backend Connection & Engine Tracking
  const [backendStatus, setBackendStatus] = useState<BackendConnectionStatus>({
    isConnected: false,
    isChecking: false,
    url: 'http://localhost:8000',
    engineName: 'Integrated High-Precision Hybrid Engine'
  });

  // Manufacturing Master Product Configuration
  const [productConfig, setProductConfig] = useState<ProductConfig>({
    id: 'PROD-01',
    name: 'Industrial Transmission Unit (Standard Drive)',
    currentInventory: 6000000,
    safetyStockTarget: 1000000,
    monthlyCapacity: 7000000,
    leadTimeWeeks: 3.0,
    unitProductionCost: 45,
    unitHoldingCost: 4.5,
    unitShortageCost: 120,
    processingTimeHours: 1.2
  });

  const checkBackend = async () => {
    const status = await planningApi.checkHealth();
    setBackendStatus(status);
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const handleRecalculateProductionPlan = async () => {
    const demands = monthlyPlan.map((m) => m.demand);
    const res = await planningApi.getProductionPlan(
      [productConfig],
      demands,
      productConfig.monthlyCapacity,
      monthlyPlan.length
    );
    setMonthlyPlan(res.monthlyPlan);
    setSummary(res.summary);
    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Production Plan Recalculated',
      message: `LP exact solver converged with ${res.summary.primaryRecommendation}`,
      duration: 5000
    });
  };

  // File Upload State Tracking
  const [isCustomDataLoaded, setIsCustomDataLoaded] = useState<boolean>(false);
  const [currentCustomFilename, setCurrentCustomFilename] = useState<string>('');
  const [toast, setToast] = useState<ToastData | null>(null);

  const handleAskAgentWithQuery = (query: string) => {
    setPendingAgentQuery(query);
    setActiveTab('agent');
    setMobileSidebarOpen(false);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  // Handle successful data import from CSV or JSON
  const handleDataImported = (result: ImportResult) => {
    if (result.success && result.monthlyPlan && result.summary) {
      setMonthlyPlan(result.monthlyPlan);
      setSummary(result.summary);
      if (result.historicalDemand) {
        setHistoricalDemand(result.historicalDemand);
      }
      setIsCustomDataLoaded(true);
      setCurrentCustomFilename(result.filename);

      // Trigger Success Toast Notification
      setToast({
        id: String(Date.now()),
        type: 'success',
        title: 'Company Data Imported Successfully',
        message: result.message,
        filename: result.filename,
        fileType: result.fileType,
        itemCount: result.itemCount,
        totalDemand: result.totalDemand,
        totalProduction: result.totalProduction,
        duration: 6000
      });
    }
  };

  // Handle direct file upload via native input
  const handleDirectFileUpload = async (file: File) => {
    try {
      const result = await parseUploadedFile(file);
      if (result.success) {
        handleDataImported(result);
      } else {
        setToast({
          id: String(Date.now()),
          type: 'error',
          title: 'Import Failed',
          message: result.message || 'The uploaded file could not be parsed.',
          filename: file.name,
          fileType: file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv',
          duration: 6000
        });
      }
    } catch (err: any) {
      setToast({
        id: String(Date.now()),
        type: 'error',
        title: 'Import Error',
        message: err.message || 'An unexpected error occurred while reading the file.',
        filename: file.name,
        duration: 6000
      });
    }
  };

  // Reset to default baseline plant schedule
  const handleResetToBaseline = () => {
    setSummary(INITIAL_SUMMARY);
    setMonthlyPlan(BASELINE_MONTHLY_PLAN);
    setHistoricalDemand(HISTORICAL_DEMAND_SERIES);
    setIsCustomDataLoaded(false);
    setCurrentCustomFilename('');

    setToast({
      id: String(Date.now()),
      type: 'info',
      title: 'Restored Baseline Plan',
      message: 'Reverted to default Plant 04 baseline (3.60 Cr demand / 3.10 Cr target output).',
      duration: 4000
    });
  };

  // Apply custom plan from AI Planning Agent to entire app
  const handleApplyPlanFromAgent = (newPlan: MonthlyPlanItem[], newSummary: PlanningSummary) => {
    setMonthlyPlan(newPlan);
    setSummary(newSummary);
    setIsCustomDataLoaded(true);
    setCurrentCustomFilename('AI Agent Plan');

    // Update historical demand series forecast portion
    setHistoricalDemand((prev) => {
      return prev.map((pt) => {
        const matching = newPlan.find((p) => p.month.toLowerCase() === pt.month.toLowerCase());
        if (matching && pt.isForecast) {
          return {
            ...pt,
            demand: matching.demand,
            upperBound: Math.round(matching.demand * 1.07),
            lowerBound: Math.round(matching.demand * 0.93)
          };
        }
        return pt;
      });
    });

    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'AI Production Plan Applied',
      message: `Updated all dashboard tabs with new target output of ${formatUnits(
        newSummary.recommendedProduction
      )}.`,
      filename: 'AI Agent Plan',
      totalDemand: newSummary.forecastDemand,
      duration: 5000
    });
  };

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] text-slate-900 flex flex-col antialiased selection:bg-orange-600 selection:text-white font-sans">
      {/* Production & Operations Management Opening Animation */}
      <AnimatePresence>
        {showIntro && <NexforgeIntro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      <div className="flex flex-1 min-h-screen relative overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            planFeasible={summary.planFeasible}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onDirectFileUpload={handleDirectFileUpload}
            isCustomDataLoaded={isCustomDataLoaded}
            currentCustomFilename={currentCustomFilename}
            onResetToBaseline={handleResetToBaseline}
            onReplayIntro={() => setShowIntro(true)}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-72 max-w-[85vw] bg-white border-r border-orange-200 h-full shadow-2xl flex flex-col">
              <div className="p-4 border-b border-orange-200 flex items-center justify-between bg-orange-50/80">
                <NexforgeLogo size="sm" showText={true} />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-orange-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  activeTab={activeTab}
                  onSelectTab={handleSelectTab}
                  planFeasible={summary.planFeasible}
                  onOpenUploadModal={() => {
                    setMobileSidebarOpen(false);
                    setIsUploadModalOpen(true);
                  }}
                  onDirectFileUpload={(file) => {
                    setMobileSidebarOpen(false);
                    handleDirectFileUpload(file);
                  }}
                  isCustomDataLoaded={isCustomDataLoaded}
                  currentCustomFilename={currentCustomFilename}
                  onResetToBaseline={handleResetToBaseline}
                  onReplayIntro={() => {
                    setMobileSidebarOpen(false);
                    setShowIntro(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Light Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FFF8F1]">
          {/* Mobile Top Bar */}
          <div className="lg:hidden bg-white text-slate-900 px-4 py-3 flex items-center justify-between border-b border-orange-200 sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg text-slate-700 hover:bg-orange-50 cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <NexforgeLogo size="xs" showText={true} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIntro(true)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 cursor-pointer font-mono text-xs font-semibold"
                title="Replay Intro"
              >
                Intro
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="p-1.5 rounded-lg bg-orange-100 text-orange-800 border border-orange-300 font-mono text-xs flex items-center gap-1 cursor-pointer"
                title="Upload CSV/JSON File"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Standard Header */}
          <Header
            summary={summary}
            user={currentUser}
            isCustomDataLoaded={isCustomDataLoaded}
            currentCustomFilename={currentCustomFilename}
            backendStatus={backendStatus}
            onResetToBaseline={handleResetToBaseline}
            onOpenWhyThisPlan={() => setIsWhyThisPlanOpen(true)}
            onAskAgent={() => handleSelectTab('agent')}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onDirectFileUpload={handleDirectFileUpload}
            onReplayIntro={() => setShowIntro(true)}
            onLogout={handleLogout}
            onCheckBackendHealth={checkBackend}
          />

          {/* Tab Navigation Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {activeTab === 'overview' && (
              <OverviewView
                summary={summary}
                monthlyPlan={monthlyPlan}
                historicalDemand={historicalDemand}
                onNavigateTab={handleSelectTab}
                onOpenWhyThisPlan={() => setIsWhyThisPlanOpen(true)}
                onAskAgentWithQuery={handleAskAgentWithQuery}
              />
            )}

            {activeTab === 'forecast' && (
              <ForecastView historicalDemand={historicalDemand} />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                monthlyPlan={monthlyPlan}
                startingInventory={summary.currentInventory}
                safetyStockTarget={summary.safetyStock}
              />
            )}

            {(activeTab === 'production' || activeTab === 'planning') && (
              <ProductionPlanningPage
                monthlyPlan={monthlyPlan}
                summary={summary}
                productConfig={productConfig}
                onRecalculate={handleRecalculateProductionPlan}
              />
            )}

            {activeTab === 'scheduling' && (
              <ProductionSchedulingPage
                initialProductionQuantity={summary.recommendedProduction}
              />
            )}

            {activeTab === 'scenarios' && (
              <ScenarioView
                monthlyPlan={monthlyPlan}
                summary={summary}
                onAskAgentWithQuery={handleAskAgentWithQuery}
                onNavigateTab={handleSelectTab}
              />
            )}

            {activeTab === 'agent' && (
              <AgentView
                initialQuestion={pendingAgentQuery}
                currentSummary={summary}
                currentMonthlyPlan={monthlyPlan}
                onApplyPlanToApp={handleApplyPlanFromAgent}
              />
            )}

            {activeTab === 'quantum' && (
              <QuantumOptimizationPage
                productConfig={productConfig}
              />
            )}
          </main>
        </div>
      </div>

      {/* "Why this plan?" 5-Step Reasoning Modal */}
      <ReasoningModal
        isOpen={isWhyThisPlanOpen}
        onClose={() => setIsWhyThisPlanOpen(false)}
        summary={summary}
        monthlyPlan={monthlyPlan}
        onTestScenario={() => {
          setIsWhyThisPlanOpen(false);
          handleSelectTab('scenarios');
        }}
        onAskAgent={() => {
          setIsWhyThisPlanOpen(false);
          handleSelectTab('agent');
        }}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataImported={handleDataImported}
        onResetToBaseline={handleResetToBaseline}
        isCustomDataLoaded={isCustomDataLoaded}
        currentFilename={currentCustomFilename}
      />

      {/* Animated Success/Error Toast Notification */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

