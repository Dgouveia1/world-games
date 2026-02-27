import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { CalendarView } from './components/CalendarView';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadDrawer } from './components/LeadDrawer';
import { AICalibration } from './components/AICalibration';
import { WhatsAppConnect } from './components/WhatsAppConnect';
import { ChatView } from './components/ChatView';
import { MassBroadcastView } from './components/MassBroadcastView';
import { ReportsView } from './components/ReportsView';
import { ClientesView } from './components/ClientesView';
import { TENANTS, ACTIVE_TENANT, MOCK_LEADS } from './constants';
import { Lead } from './types';
import { Menu, LayoutDashboard, CalendarDays, Baby, MessageSquare } from 'lucide-react';

// Simple Router/State implementation
const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [tenantId] = useState('curumim'); // Tenant ativo: Grupo Curumim
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tenant = TENANTS[tenantId] || ACTIVE_TENANT;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <HomeView primaryColor={tenant.primaryColor} onNavigate={setCurrentView} />;
      case 'calendar':
        return <CalendarView primaryColor={tenant.primaryColor} onNavigate={setCurrentView} />;
      case 'kanban':
        return (
          <KanbanBoard
            leads={MOCK_LEADS}
            primaryColor={tenant.primaryColor}
            onLeadClick={setSelectedLead}
          />
        );
      case 'clientes':
        return <ClientesView primaryColor={tenant.primaryColor} />;
      case 'ai-calibration':
        return <AICalibration tenant={tenant} />;
      case 'whatsapp':
        return <WhatsAppConnect tenant={tenant} />;
      case 'chat':
        return <ChatView primaryColor={tenant.primaryColor} />;
      case 'broadcast':
        return <MassBroadcastView primaryColor={tenant.primaryColor} />;
      case 'reports':
        return <ReportsView primaryColor={tenant.primaryColor} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500 flex-col">
            <div className="text-4xl font-bold opacity-20 mb-4">Em Desenvolvimento</div>
            <p>A funcionalidade {currentView} estará disponível em breve.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-dark-900 text-slate-100 font-sans selection:bg-brand-500/30 overflow-hidden">
      <Sidebar
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }}
        tenant={tenant}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 ml-0 md:ml-64 relative overflow-y-auto bg-gradient-to-br from-dark-900 via-dark-900 to-dark-800 pb-20 md:pb-0">
        {/* Subtle background glow effect */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20"
          style={{ backgroundColor: tenant.primaryColor }}
        />

        {renderContent()}
      </main>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-gray-800 flex justify-around items-center h-16 z-40 px-2 pb-safe shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
          { id: 'calendar', icon: CalendarDays, label: 'Agenda' },
          { id: 'clientes', icon: Baby, label: 'Clientes' },
          { id: 'chat', icon: MessageSquare, label: 'Chat' },
        ].map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`p-2 flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}
              style={isActive ? { color: tenant.primaryColor } : {}}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 flex flex-col items-center gap-1 transition-colors text-gray-500"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>

      <LeadDrawer
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        primaryColor={tenant.primaryColor}
      />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
