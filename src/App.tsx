import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { PatientFlowView } from './components/views/PatientFlowView';
import { BedManagementView } from './components/views/BedManagementView';
import { ArrivalForecastsView } from './components/views/ArrivalForecastsView';
import { ResourceUtilizationView } from './components/views/ResourceUtilizationView';
import { AlertsRecommendationsView } from './components/views/AlertsRecommendationsView';
import { SettingsView } from './components/views/SettingsView';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab } = useHospital();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'patient_flow':
        return <PatientFlowView />;
      case 'bed_management':
        return <BedManagementView />;
      case 'arrival_forecasts':
        return <ArrivalForecastsView />;
      case 'resource_utilization':
        return <ResourceUtilizationView />;
      case 'alerts_recommendations':
        return <AlertsRecommendationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar Header */}
      <Header />

      {/* Mobile Menu Toggle Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-1.5 rounded-lg border border-slate-200 bg-slate-50"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Navigation Menu</span>
        </button>
        <span className="text-xs font-semibold text-slate-500 capitalize">
          {activeTab.replace('_', ' ')}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-64 bg-white h-full shadow-2xl flex flex-col">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-7 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <MainLayout />
    </HospitalProvider>
  );
}
