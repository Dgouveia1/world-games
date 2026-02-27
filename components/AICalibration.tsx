import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Save, RotateCcw, Play, Zap, BrainCircuit,
  User, Smartphone, PartyPopper, Baby, Home, Music,
  ChevronDown, Plus, Trash2, Check,
} from 'lucide-react';
import { AISettings, Tenant, TipoServico } from '../types';
import { ACTIVE_TENANT } from '../constants';

interface AICalibrationProps {
  tenant: Tenant;
}

// ─────────────────────────────────────────────────────────────
// PERSONAS PRÉ-DEFINIDAS PARA O NICHO DE FESTAS
// ─────────────────────────────────────────────────────────────

interface Persona {
  id: string;
  nome: string;
  emoji: string;
  foco: TipoServico | 'all';
  descricao: string;
  tone: AISettings['tone'];
  creativity: number;
  responseLength: AISettings['responseLength'];
  systemPrompt: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'lulinha',
    nome: 'Lulinha',
    emoji: '🎉',
    foco: 'all',
    descricao: 'Atendente geral, acolhedora e animada. Ideal para o primeiro contato.',
    tone: 'friendly',
    creativity: 0.7,
    responseLength: 'medium',
    systemPrompt: `Você é Lulinha, a atendente virtual do World Games — a maior referência em Festas Infantis, Espaço Kids e Recreação da região.

Seu estilo: caloroso, alegre, usa emojis com moderação e faz a família se sentir especial desde o primeiro contato.

Regras obrigatórias:
1. Sempre pergunte o nome da criança e o tema desejado logo no início.
2. Nunca cite preços sem antes perguntar o número de crianças e a data do evento.
3. Ao capturar data, nome e tema, ofereça agendar uma visita ao espaço ou enviar um orçamento personalizado.
4. Use frases como "Que ideia incrível!", "A [nome_crianca] vai amar!" para criar vínculo emocional.
5. Se o cliente hesitar, ofereça o diferencial: "Aqui cada detalhe é pensado para o seu filho(a). Posso te mostrar alguns eventos que realizamos?"`,
  },
  {
    id: 'festa-pro',
    nome: 'Festa Pro',
    emoji: '🎂',
    foco: 'festa',
    descricao: 'Especialista em fechar pacotes de festa. Tom consultivo e foco em upgrade de pacote.',
    tone: 'consultative',
    creativity: 0.5,
    responseLength: 'medium',
    systemPrompt: `Você é o Festa Pro, consultor especializado em pacotes de festa do World Games.

Seu objetivo: qualificar o lead e guiá-lo até o pacote ideal (Básico, Encantado ou Premium), sempre tentando upgrade.

Funil de perguntas:
1. "Para quantas crianças você está pensando?"
2. "Qual tema vocês estão considerando?"
3. "A data já está definida?"
4. Após respostas → "Perfeito! Para [qtd] crianças com tema [tema], recomendo o Pacote [Encantado/Premium]. Ele inclui [benefícios]. Posso te enviar todos os detalhes agora?"

Técnica de upgrade: compare dois pacotes, destacando o que o cliente ganha com o superior. Exemplo: "Por apenas R$ 500 a mais, você inclui DJ, mesa de doces personalizada e recreadores por mais 1h."`,
  },
  {
    id: 'kids-guide',
    nome: 'Kids Guide',
    emoji: '🏠',
    foco: 'espaco_kids',
    descricao: 'Focado no Espaço Kids. Apresenta a estrutura, horários e vantagens do espaço.',
    tone: 'friendly',
    creativity: 0.6,
    responseLength: 'short',
    systemPrompt: `Você é o Kids Guide, especialista no Espaço Kids do World Games.

Missão: apresentar o espaço e converter em visita presencial ou reserva.

Pontos obrigatórios a destacar:
- Estrutura segura e higienizada, projetada para 0 a 12 anos
- Escorregador coberto, piscina de bolinhas, tobogã, área baby e parquinho
- Equipe de monitores treinados sempre presentes
- Disponível para reservas exclusivas aos finais de semana

Abordagem: Use perguntas como "Sua filha tem quantos anos?" para personalizar a resposta. Se for bebê → "Temos área baby especial com piso macio e monitoras dedicadas!" Se maior → "Ela vai se jogar no tobogã twin! 😄"

Sempre encerre com: "Que tal agendar uma visita gratuita para ela conhecer? Sem compromisso!"`,
  },
  {
    id: 'recreio-rei',
    nome: 'Recreio Rei',
    emoji: '🎪',
    foco: 'recreacao',
    descricao: 'Especialista em eventos externos e recreação. Foco em datas, logística e volume.',
    tone: 'professional',
    creativity: 0.4,
    responseLength: 'medium',
    systemPrompt: `Você é o Recreio Rei, especialista em serviços de recreação externa do World Games.

Perfil do cliente-alvo: condomínios, empresas, escolas ou famílias que querem recreadores qualificados em local externo.

Perguntas de qualificação:
1. "Qual é o tipo do evento? (aniversário, festa junina, dia das crianças...)"
2. "Quantas crianças participarão?"
3. "O evento será em qual local e por quantas horas?"

Após qualificar → "Posso montar uma proposta customizada. Nossa equipe inclui [N] recreadores, materiais lúdicos completos e seguro de responsabilidade. Você consegue me confirmar o endereço e a data exata?"

Tom: profissional mas simpático. Sem emojis excessivos.`,
  },
];

// ─────────────────────────────────────────────────────────────
// HELPERS: Respostas simuladas por persona e tom
// ─────────────────────────────────────────────────────────────

function buildSimulatedResponse(msg: string, settings: AISettings, persona: Persona): string {
  const lower = msg.toLowerCase();
  const nome = persona.nome;

  if (lower.includes('preço') || lower.includes('valor') || lower.includes('quanto')) {
    if (persona.foco === 'espaco_kids') return `Nossos pacotes de Espaço Kids começam a partir de R$ 2.500 para até 20 crianças por 4h. Mas antes de te enviar os valores exatos, me conta: quantas crianças participarão e qual é a data? Assim preparo uma proposta certinha! 🏠`;
    return `Para te passar o valor mais preciso, preciso de algumas informações! 😊 Quantas crianças serão? E já tem data definida? Com esses detalhes, preparo um orçamento personalizado rapidinho!`;
  }
  if (lower.includes('tema') || lower.includes('princesa') || lower.includes('dinossauro') || lower.includes('minecraft')) {
    return `Que tema incrível! 🎉 A gente adora personalizar cada detalhe para deixar a festa única! Me conta: quantas crianças são esperadas e qual a data prevista? Vou verificar a disponibilidade do espaço agora!`;
  }
  if (lower.includes('data') || lower.includes('quando') || lower.includes('disponível')) {
    return `Ótima pergunta! Para verificar a disponibilidade, me diz: qual seria a data aproximada e para quantas crianças? Nossa agenda abre com 90 dias de antecedência e os finais de semana enchem rápido! 📅`;
  }
  if (lower.includes('visita') || lower.includes('conhecer') || lower.includes('ver')) {
    return `Perfeito! Adoramos receber as famílias aqui! 🏠 Temos horários de visita de segunda a sábado, das 9h às 17h. Qual dia da semana fica melhor para você?`;
  }

  // Resposta genérica baseada no tom
  const respostas: Record<AISettings['tone'], string> = {
    friendly: `Que legal que você entrou em contato! 🎈 Sou ${nome} do World Games. Como posso deixar a festa da criançada ainda mais especial hoje?`,
    consultative: `Olá! Sou ${nome}, do World Games. Para montar a proposta ideal, me conta um pouco mais sobre o que você está buscando. Que tipo de evento você tem em mente?`,
    professional: `Bom dia! ${nome} do World Games. Por favor, informe o tipo de evento, número de participantes e data prevista para que eu possa preparar uma proposta completa.`,
    aggressive: `Olá! Aproveite — nossa agenda para ${new Date().toLocaleDateString('pt-BR', { month: 'long' })} está quase cheia! Me passa os detalhes do evento agora e garantimos sua data com prioridade! 🚀`,
  };
  return respostas[settings.tone] ?? respostas['friendly'];
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

export const AICalibration: React.FC<AICalibrationProps> = ({ tenant }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(PERSONAS[0].id);
  const [settings, setSettings] = useState<AISettings>({
    modelName: 'GPT-4 Turbo (Events Optimized)',
    creativity: PERSONAS[0].creativity,
    tone: PERSONAS[0].tone,
    responseLength: PERSONAS[0].responseLength,
    systemPrompt: PERSONAS[0].systemPrompt,
    persona_nome: PERSONAS[0].nome,
    foco_servico: PERSONAS[0].foco,
  });

  const [testMessage, setTestMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: `Olá! 🎉 Sou ${PERSONAS[0].nome}, do ${tenant.name}. Como posso ajudar a criar uma festa inesquecível hoje?` },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [saved, setSaved] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activePersona = PERSONAS.find(p => p.id === selectedPersonaId) ?? PERSONAS[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const applyPersona = (p: Persona) => {
    setSelectedPersonaId(p.id);
    setSettings({
      modelName: 'GPT-4 Turbo (Events Optimized)',
      creativity: p.creativity,
      tone: p.tone,
      responseLength: p.responseLength,
      systemPrompt: p.systemPrompt,
      persona_nome: p.nome,
      foco_servico: p.foco,
    });
    setChatHistory([
      { role: 'ai', content: `Olá! ${p.emoji} Sou ${p.nome}, do ${tenant.name}. Como posso ajudar hoje?` },
    ]);
  };

  const handleTestSend = () => {
    if (!testMessage.trim() || isTyping) return;
    const newHistory = [...chatHistory, { role: 'user' as const, content: testMessage }];
    setChatHistory(newHistory);
    setTestMessage('');
    setIsTyping(true);
    setTimeout(() => {
      const response = buildSimulatedResponse(testMessage, settings, activePersona);
      setChatHistory([...newHistory, { role: 'ai', content: response }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 600);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TONE_OPTIONS: { value: AISettings['tone']; label: string; desc: string }[] = [
    { value: 'friendly', label: 'Amigável', desc: 'Emojis, linguagem casual e calorosa' },
    { value: 'consultative', label: 'Consultivo', desc: 'Perguntas estratégicas e orientação' },
    { value: 'professional', label: 'Profissional', desc: 'Formal, direto e objetivo' },
    { value: 'aggressive', label: 'Urgência', desc: 'Foco em fechamento rápido' },
  ];

  const FOCO_ICON: Record<TipoServico | 'all', React.ElementType> = {
    all: PartyPopper,
    festa: Baby,
    espaco_kids: Home,
    recreacao: Music,
    outro: PartyPopper,
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0 overflow-hidden">

      {/* ══════════════════════════════════════
          PAINEL ESQUERDO — Configuração
      ══════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-6 border-r border-gray-800 space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6" style={{ color: tenant.primaryColor }} />
            Calibrar Copiloto IA
          </h2>
          <p className="text-gray-500 text-sm mt-1">Configure a personalidade e o foco da sua IA de atendimento.</p>
        </div>

        {/* Seletor de Persona */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
            Persona Ativa
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PERSONAS.map(p => {
              const FocoIcon = FOCO_ICON[p.foco];
              const isActive = selectedPersonaId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => applyPersona(p)}
                  className={`text-left p-4 rounded-xl border transition-all ${isActive
                    ? 'border-2 bg-gray-800/60'
                    : 'border-gray-700/50 bg-gray-900/40 hover:border-gray-600'
                    }`}
                  style={isActive ? { borderColor: tenant.primaryColor } : {}}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{p.emoji}</span>
                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{p.nome}</span>
                    {isActive && <Check className="w-3.5 h-3.5 ml-auto" style={{ color: tenant.primaryColor }} />}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">{p.descricao}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tom de Voz */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Tom de Voz</label>
          <div className="grid grid-cols-2 gap-2">
            {TONE_OPTIONS.map(t => (
              <button
                key={t.value}
                onClick={() => setSettings(s => ({ ...s, tone: t.value }))}
                className={`px-3 py-3 rounded-xl text-left text-sm border transition-all ${settings.tone === t.value
                  ? 'text-white border-opacity-60'
                  : 'bg-gray-900/40 border-gray-700/50 text-gray-400 hover:border-gray-600'
                  }`}
                style={settings.tone === t.value
                  ? { backgroundColor: tenant.primaryColor + '20', borderColor: tenant.primaryColor + '80', color: 'white' }
                  : {}}
              >
                <span className="font-semibold block mb-0.5">{t.label}</span>
                <span className="text-[11px] opacity-70 font-normal">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Criatividade */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-300">Temperatura (Criatividade)</label>
            <span className="text-sm font-bold font-mono" style={{ color: tenant.primaryColor }}>
              {Math.round(settings.creativity * 100)}%
            </span>
          </div>
          <input
            type="range" min="0" max="1" step="0.1"
            value={settings.creativity}
            onChange={e => setSettings(s => ({ ...s, creativity: parseFloat(e.target.value) }))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: tenant.primaryColor }}
          />
          <div className="flex justify-between mt-2 text-[10px] text-gray-600">
            <span>Preciso & Factual</span>
            <span>Criativo & Expansivo</span>
          </div>
        </div>

        {/* Tamanho da Resposta */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Tamanho da Resposta</label>
          <div className="flex gap-2">
            {(['short', 'medium', 'long'] as const).map(l => (
              <button
                key={l}
                onClick={() => setSettings(s => ({ ...s, responseLength: l }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition ${settings.responseLength === l ? 'text-white' : 'text-gray-500 border-gray-700/50 hover:border-gray-600'
                  }`}
                style={settings.responseLength === l
                  ? { backgroundColor: tenant.primaryColor + '20', borderColor: tenant.primaryColor + '70', color: 'white' }
                  : {}}
              >
                {{ short: 'Curta', medium: 'Média', long: 'Longa' }[l]}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt do Sistema */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
            Prompt do Sistema
          </label>
          <textarea
            className="w-full h-52 bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 text-xs text-gray-300
                       focus:outline-none focus:border-gray-500 transition font-mono leading-relaxed resize-none"
            value={settings.systemPrompt}
            onChange={e => setSettings(s => ({ ...s, systemPrompt: e.target.value }))}
            placeholder="Instruções base para o modelo de IA..."
          />
          <p className="text-[10px] text-gray-600 mt-1 text-right">{settings.systemPrompt.length} caracteres</p>
        </div>

        {/* Ações */}
        <div className="flex gap-3 sticky bottom-0 pb-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
            style={{ backgroundColor: saved ? '#22c55e' : tenant.primaryColor, color: '#1a1a1a' }}
          >
            {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar Configuração</>}
          </button>
          <button
            onClick={() => applyPersona(activePersona)}
            title="Restaurar persona padrão"
            className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          PAINEL DIREITO — Simulador WhatsApp
      ══════════════════════════════════════ */}
      <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col border-l border-gray-800 overflow-hidden">

        {/* Header do Simulador */}
        <div className="px-5 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <h3 className="font-semibold text-white text-sm">Simulador</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-semibold">{activePersona.emoji} {activePersona.nome}</span>
            </div>
            <button
              onClick={() => setChatHistory([{ role: 'ai', content: `Olá! ${activePersona.emoji} Sou ${activePersona.nome}, do ${tenant.name}. Como posso ajudar hoje?` }])}
              title="Reiniciar conversa"
              className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Área do Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a]">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ backgroundColor: tenant.primaryColor + '25', border: `1px solid ${tenant.primaryColor}40` }}>
                  {activePersona.emoji}
                </div>
              )}
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                ? 'rounded-br-sm text-white'
                : 'rounded-bl-sm bg-gray-800/80 border border-gray-700/50 text-gray-200'
                }`}
                style={msg.role === 'user' ? { backgroundColor: tenant.primaryColor, color: '#1a1a1a' } : {}}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: tenant.primaryColor + '25' }}>
                {activePersona.emoji}
              </div>
              <div className="bg-gray-800/80 border border-gray-700/50 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Sugestões de teste */}
        <div className="px-4 pt-2 flex gap-1.5 overflow-x-auto pb-1 flex-shrink-0">
          {['Quanto custa a festa?', 'Tema Minecraft', 'Tem data disponível?', 'Quero visitar'].map(s => (
            <button
              key={s}
              onClick={() => { setTestMessage(s); }}
              className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input do Chat */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/30 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Simule uma mensagem de cliente..."
              className="flex-1 bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white
                         placeholder-gray-600 focus:outline-none focus:border-gray-500 transition"
              value={testMessage}
              onChange={e => setTestMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTestSend()}
            />
            <button
              onClick={handleTestSend}
              disabled={isTyping || !testMessage.trim()}
              className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5
                         transition disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: tenant.primaryColor, color: '#1a1a1a' }}
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 text-center flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" /> Ambiente de teste seguro. Não envia mensagens reais.
          </p>
        </div>
      </div>
    </div>
  );
};