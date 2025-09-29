// components/AdminPanel.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { ChatUser, ChatChannel, ChatUserStatus, ThemeSettings, NotificationPrefs } from '../types';
import RGBBorderWrapper from './RGBBorderWrapper';
import { ArrowPathIcon } from './Icons';
import { CHAT_ROLES, THEME_COLORS } from '../constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: ChatUser;
  users: ChatUser[];
  channels: ChatChannel[];
  logs: any[];
  onBroadcast: (message: string, type: 'normal' | 'alert' | 'hack') => void;
  onUpdateUser: (userId: string, updates: Partial<ChatUser>) => void;
  onUpdateChannel: (channelId: string, updates: Partial<ChatChannel>) => void;
  onAddChannel: (name: string, isPrivate: boolean) => void;
  onAddLog: (action: string, details: string) => void;
  updateUserSettings: (settings: { themeSettings?: Partial<ThemeSettings>; notificationPrefs?: Partial<NotificationPrefs> }) => void;
}

type ActiveTab = 'monitoring' | 'users' | 'rooms' | 'broadcast' | 'logs' | 'experiments' | 'interface';

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, adminUser, users, channels, logs, onBroadcast, onUpdateUser, onUpdateChannel, onAddChannel, onAddLog, updateUserSettings
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitoring');
  const [animationStep, setAnimationStep] = useState<'start' | 'accessing' | 'unlocked' | 'closing'>('start');

  // State for forms and filters
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'normal' | 'alert' | 'hack'>('normal');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelIsPrivate, setNewChannelIsPrivate] = useState(false);
  const [logFilterUser, setLogFilterUser] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('');
  const [experiments, setExperiments] = useState({ autoAnalysis: false, observerAI: false, chaosMode: false });

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
        const userMatch = log.user?.toLowerCase().includes(logFilterUser.toLowerCase());
        const actionMatch = log.action?.toLowerCase().includes(logFilterAction.toLowerCase());
        return userMatch && actionMatch;
    });
  }, [logs, logFilterUser, logFilterAction]);

  useEffect(() => {
    if (isOpen) {
      setAnimationStep('accessing');
      const timer1 = setTimeout(() => setAnimationStep('unlocked'), 1500);
      return () => clearTimeout(timer1);
    }
  }, [isOpen]);

  const handleClose = () => {
    setAnimationStep('closing');
    onAddLog('Encerrou Painel KACC', `Sessão encerrada por ${adminUser.nickname}.`);
    onBroadcast(`Painel administrativo encerrado por ${adminUser.nickname}.`, 'normal');
    setTimeout(onClose, 500);
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    onBroadcast(broadcastMessage, broadcastType);
    onAddLog('Enviou Broadcast', `Tipo: ${broadcastType}, Mensagem: "${broadcastMessage.substring(0, 20)}..."`);
    setBroadcastMessage('');
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    onAddChannel(newChannelName, newChannelIsPrivate);
    setNewChannelName('');
    setNewChannelIsPrivate(false);
  };

  const handleToggleExperiment = (exp: keyof typeof experiments) => {
    const newState = !experiments[exp];
    setExperiments(prev => ({ ...prev, [exp]: newState }));
    onBroadcast(`Módulo experimental '${exp}' foi ${newState ? 'ATIVADO' : 'DESATIVADO'}.`, 'hack');
    onAddLog('Alterou Experimento', `Módulo ${exp} ${newState ? 'ativado' : 'desativado'}.`);
  };

  const handleUpdateThemeColor = (colorValue: string) => {
    updateUserSettings({ themeSettings: { accentColor: colorValue } });
    onAddLog('Alterou Interface', `Cor de destaque alterada para ${colorValue}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'monitoring':
        const onlineUsers = users.filter(u => u.status !== 'offline');
        const stealthUsers = users.filter(u => u.status === 'stealth');
        return <div>
          <h3 className="text-xl font-bold text-sky-300 mb-4">👁️ Monitoramento de Sessões</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-700/50 p-3 rounded-lg"><p className="text-slate-400">🟢 Usuários Online</p><p className="font-bold text-white text-2xl">{onlineUsers.length}</p></div>
            <div className="bg-slate-700/50 p-3 rounded-lg"><p className="text-slate-400">📡 Salas Ativas</p><p className="font-bold text-white text-2xl">{channels.length}</p></div>
            <div className="bg-slate-700/50 p-3 rounded-lg"><p className="text-slate-400">🔄 Último CKEY Gerado</p><p className="font-bold text-white font-mono text-xs">CKEY_...{Date.now().toString(36).slice(-8)}</p></div>
            <div className="bg-slate-700/50 p-3 rounded-lg"><p className="text-slate-400">🕵️ Usuários em Modo Stealth</p><p className="font-bold text-red-400 text-2xl">{stealthUsers.length}</p></div>
          </div>
        </div>;
      case 'users':
        return <div>
          <h3 className="text-xl font-bold text-sky-300 mb-4">👤 Controle de Usuários</h3>
          <div className="overflow-auto max-h-[55vh] custom-scrollbar pr-2">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-700/50 text-xs text-slate-300 uppercase">
                    <tr><th className="p-2">Nickname</th><th className="p-2">Cargo</th><th className="p-2">Status</th><th className="p-2">Ações</th></tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                            <td className="p-2 font-medium">{u.nickname} {u.isBanned && <span className="text-red-500">(Banido)</span>} {u.isFrozen && <span className="text-blue-400">(Congelado)</span>}</td>
                            <td className="p-2">{CHAT_ROLES.find(r => r.id === u.roleId)?.name || 'N/A'}</td>
                            <td className="p-2">{u.status}</td>
                            <td className="p-2 space-x-1">
                                <button onClick={() => onUpdateUser(u.id, { isBanned: !u.isBanned })} className="text-xs bg-red-500/80 px-2 py-1 rounded hover:bg-red-500">🚫</button>
                                <button onClick={() => onUpdateUser(u.id, { isFrozen: !u.isFrozen })} className="text-xs bg-blue-500/80 px-2 py-1 rounded hover:bg-blue-500">❄️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>;
      case 'rooms':
        return <div>
          <h3 className="text-xl font-bold text-sky-300 mb-4">⚙️ Gerenciamento de Salas</h3>
          <div className="mb-6 bg-slate-700/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">➕ Criar Nova Sala</h4>
            <div className="flex gap-2">
              <input type="text" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="nome-da-sala" className="flex-grow bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"/>
              <label className="flex items-center text-sm"><input type="checkbox" checked={newChannelIsPrivate} onChange={e => setNewChannelIsPrivate(e.target.checked)} className="mr-1.5 accent-sky-500"/> Privada</label>
              <button onClick={handleCreateChannel} className="bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded text-sm">Criar</button>
            </div>
          </div>
          <div className="space-y-2">
            {channels.map(c => (
              <div key={c.id} className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <span>#{c.name} {c.isLocked && '🛑'} {c.isPrivate && '🔒'}</span>
                <div className="space-x-1">
                    <button onClick={() => onUpdateChannel(c.id, { isLocked: !c.isLocked })} className="bg-slate-600 hover:bg-slate-500 text-xs px-2 py-1 rounded">{c.isLocked ? 'Abrir' : 'Fechar'}</button>
                    <button onClick={() => onUpdateChannel(c.id, { isPrivate: !c.isPrivate })} className="bg-slate-600 hover:bg-slate-500 text-xs px-2 py-1 rounded">{c.isPrivate ? 'Pública' : 'Privada'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>;
      case 'broadcast':
         return <div>
            <h3 className="text-xl font-bold text-sky-300 mb-4">📢 Broadcast de Sistema</h3>
            <div className="space-y-4">
              <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} rows={4} className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500" placeholder="Sua mensagem para todos os canais..."></textarea>
              <div className="flex gap-4">
                <label><input type="radio" name="btype" value="normal" checked={broadcastType === 'normal'} onChange={() => setBroadcastType('normal')} className="mr-1 accent-sky-500"/> Normal</label>
                <label><input type="radio" name="btype" value="alert" checked={broadcastType === 'alert'} onChange={() => setBroadcastType('alert')} className="mr-1 accent-sky-500"/> Alerta ⚠️</label>
                <label><input type="radio" name="btype" value="hack" checked={broadcastType === 'hack'} onChange={() => setBroadcastType('hack')} className="mr-1 accent-sky-500"/> "Hackeamento" 👨‍💻</label>
              </div>
              <button onClick={handleSendBroadcast} className="bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded text-sm font-semibold">Enviar Broadcast</button>
            </div>
          </div>;
      case 'logs':
        return <div>
            <h3 className="text-xl font-bold text-sky-300 mb-4">📂 Logs e Auditoria</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Filtrar por usuário..." value={logFilterUser} onChange={e => setLogFilterUser(e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-1/2"/>
              <input type="text" placeholder="Filtrar por ação..." value={logFilterAction} onChange={e => setLogFilterAction(e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm w-1/2"/>
            </div>
            <div className="overflow-auto max-h-[55vh] custom-scrollbar pr-2 font-mono text-xs">
              {filteredLogs.map(log => (
                <p key={log.id} className="whitespace-pre-wrap"><span className="text-slate-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</span> <span className="text-sky-400">{log.user}:</span> <span className="text-slate-300">{log.action}</span> <span className="text-slate-400">- {log.details}</span></p>
              ))}
            </div>
        </div>;
      case 'experiments':
        return <div>
            <h3 className="text-xl font-bold text-sky-300 mb-4">🧬 Sistema de Experimentos KAIROS (Beta)</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"><span className="text-slate-300">Ativar módulo de auto-análise de mensagens</span><input type="checkbox" checked={experiments.autoAnalysis} onChange={() => handleToggleExperiment('autoAnalysis')} className="w-5 h-5 accent-fuchsia-500"/></label>
              <label className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"><span className="text-slate-300">Inserir IA observadora em salas</span><input type="checkbox" checked={experiments.observerAI} onChange={() => handleToggleExperiment('observerAI')} className="w-5 h-5 accent-fuchsia-500"/></label>
              <label className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"><span className="text-slate-300">Ativar "modo caos" para testes de load</span><input type="checkbox" checked={experiments.chaosMode} onChange={() => handleToggleExperiment('chaosMode')} className="w-5 h-5 accent-fuchsia-500"/></label>
            </div>
        </div>;
      case 'interface':
        return <div>
          <h3 className="text-xl font-bold text-sky-300 mb-4">🧠 Editor de Interface ao Vivo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Paleta de Cores (Destaque VIP)</label>
              <div className="flex flex-wrap gap-3">
                  {THEME_COLORS.map(color => (
                    <button key={color.name} onClick={() => handleUpdateThemeColor(color.value)} className="w-8 h-8 rounded-full border-2 transition-all" style={{ backgroundColor: color.value, borderColor: adminUser.themeColor === color.value ? 'white' : 'transparent' }} title={color.name} />
                  ))}
              </div>
            </div>
            <p className="text-slate-400 text-sm">Outras opções de customização de interface (fontes, background) estarão disponíveis em futuras atualizações.</p>
          </div>
        </div>;
      default: return null;
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'monitoring', label: 'Monitoramento', icon: '👁️' }, { id: 'users', label: 'Usuários', icon: '👤' },
    { id: 'rooms', label: 'Salas', icon: '⚙️' }, { id: 'broadcast', label: 'Broadcast', icon: '📢' },
    { id: 'logs', label: 'Logs', icon: '📂' }, { id: 'experiments', label: 'Experimentos', icon: '🧬' },
    { id: 'interface', label: 'Interface', icon: '🧠' },
  ];

  if (animationStep === 'accessing') {
    return (
       <div className="fixed inset-0 bg-slate-900/90 z-[200] flex flex-col items-center justify-center font-mono text-green-400">
            <ArrowPathIcon className="w-16 h-16 animate-spin mb-4"/>
            <p className="text-2xl">[DESTRAVANDO ACESSO RESTRITO...]</p>
            <p className="text-lg">[KAIROS ADMIN COMMAND CONSOLE]</p>
        </div>
    )
  }

  return (
    <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 transition-opacity duration-500 ${animationStep === 'closing' ? 'opacity-0' : 'opacity-100'}`}>
      <RGBBorderWrapper rounded="rounded-xl" className="w-full max-w-6xl h-[80vh]">
        <div className="bg-slate-800/80 backdrop-blur-md w-full h-full rounded-[15px] flex flex-col" onClick={(e) => e.stopPropagation()}>
           <header className="p-4 border-b border-sky-500/30 flex justify-between items-center flex-shrink-0">
             <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-500">💻 KAIROS Admin Command Console</h2>
             <button onClick={handleClose} className="bg-red-500/50 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-red-600/70 transition-colors">Encerrar Sessão</button>
           </header>
           <div className="flex flex-grow overflow-hidden">
                <nav className="w-64 border-r border-sky-500/30 p-4 flex-shrink-0 overflow-y-auto custom-scrollbar">
                    <ul className="space-y-2">
                        {tabs.map(tab => (
                            <li key={tab.id}>
                                <button onClick={() => setActiveTab(tab.id)} className={`w-full text-left p-3 rounded-md text-sm font-medium flex items-center transition-all duration-200 ${activeTab === tab.id ? 'bg-sky-500/30 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700/50 hover:text-sky-300'}`}>
                                    <span className="mr-3 text-lg">{tab.icon}</span> {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </main>
           </div>
        </div>
      </RGBBorderWrapper>
    </div>
  );
};

export default AdminPanel;
