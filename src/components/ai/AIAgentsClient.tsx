"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, TrendingUp, Search, Megaphone, BarChart3, Users, Loader2, Send, RefreshCw, Database, ChevronRight } from "lucide-react";

const AGENTS = [
  {
    id: "marketing",
    name: "Agent Marketing",
    desc: "Stratégie, contenu, copywriting & growth",
    icon: Megaphone,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    prompts: [
      "Analyse mes données et crée un plan marketing pour doubler mes leads ce mois-ci",
      "Rédige un plan de contenu 30 jours pour un restaurant gastronomique",
      "Quelles sont les meilleures stratégies Meta Ads pour mon secteur ?",
      "Comment créer une offre irrésistible pour attirer des clients premium ?",
    ],
  },
  {
    id: "seo",
    name: "Agent SEO",
    desc: "Référencement local, mots-clés & audit",
    icon: Search,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    prompts: [
      "Génère 20 mots-clés locaux à fort potentiel pour une clinique dentaire",
      "Comment optimiser une fiche Google My Business pour un restaurant ?",
      "Audite ma stratégie SEO et identifie les priorités immédiates",
      "Comment obtenir des backlinks de qualité sans payer ?",
    ],
  },
  {
    id: "ads",
    name: "Agent Publicité",
    desc: "Meta, Google, TikTok Ads & ROAS",
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    prompts: [
      "Rédige 5 accroches publicitaires Meta haute conversion pour un salon de beauté",
      "Comment réduire mon CPL de 30% sur Google Ads ?",
      "Quelle structure de campagne TikTok pour un e-commerce mode ?",
      "Analyse mes campagnes et dis-moi où je perds de l'argent",
    ],
  },
  {
    id: "analytics",
    name: "Agent Analytics",
    desc: "KPIs, rapports & insights data",
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    prompts: [
      "Explique mes données de conversion et ce que je dois améliorer",
      "Quels KPIs surveiller chaque semaine pour mon agence ?",
      "Comment présenter mes résultats à un client non-digital ?",
      "Crée un tableau de bord mensuel pour mon agence",
    ],
  },
  {
    id: "crm",
    name: "Agent CRM",
    desc: "Lead nurturing, vente & rétention",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    prompts: [
      "Crée un script de relance pour des leads inactifs depuis 5 jours",
      "Comment qualifier un lead efficacement en moins de 2 minutes ?",
      "Rédige une séquence email de 5 messages pour nurturing",
      "Comment réduire mon taux de churn client ?",
    ],
  },
  {
    id: "growth",
    name: "Agent Growth",
    desc: "Acquisition, scaling & stratégie agence",
    icon: Sparkles,
    color: "text-diamond-gold-dark",
    bg: "bg-diamond-gold-bg",
    border: "border-diamond-gold/30",
    prompts: [
      "Comment passer de 5 à 20 clients en 90 jours ?",
      "Donne-moi 10 idées pour augmenter le LTV de mes clients",
      "Comment structurer mes offres pour maximiser mes revenus ?",
      "Stratégie pour vendre un upsell à un client existant",
    ],
  },
];

interface Message { role: "user" | "agent"; text: string; }
interface Props { clients: { id: string; businessName: string }[]; totalLeads: number; totalCampaigns: number; agencyId: string; }

export function AIAgentsClient({ clients, totalLeads, totalCampaigns }: Props) {
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = conversations[activeAgent.id] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const userMsg = (text ?? input).trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    setConversations(prev => ({ ...prev, [activeAgent.id]: newMessages }));
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: activeAgent.id,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      const reply = data.reply ?? "Je n'ai pas pu générer une réponse.";
      setConversations(prev => ({
        ...prev,
        [activeAgent.id]: [...newMessages, { role: "agent", text: reply }],
      }));
    } catch {
      setConversations(prev => ({
        ...prev,
        [activeAgent.id]: [...newMessages, { role: "agent", text: "Erreur de connexion. Réessayez." }],
      }));
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function switchAgent(agent: typeof AGENTS[0]) {
    setActiveAgent(agent);
    setInput("");
  }

  function clearChat() {
    setConversations(prev => ({ ...prev, [activeAgent.id]: [] }));
  }

  const Icon = activeAgent.icon;

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-230px)] md:h-[calc(100vh-180px)] min-h-[500px]">
      {/* Sidebar agents */}
      <div className="lg:w-56 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
        <p className="hidden lg:block text-xs font-body text-diamond-muted uppercase tracking-widest mb-1 shrink-0">Agents</p>
        {AGENTS.map(agent => {
          const AgentIcon = agent.icon;
          const active = activeAgent.id === agent.id;
          const hasConversation = (conversations[agent.id]?.length ?? 0) > 0;
          return (
            <button key={agent.id} onClick={() => switchAgent(agent)}
              className={`shrink-0 lg:w-full text-left p-3 rounded-2xl border transition-all ${active ? `${agent.border} ${agent.bg} shadow-sm` : "border-diamond-border bg-white hover:bg-diamond-raised"}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-white shadow-sm" : agent.bg}`}>
                  <AgentIcon size={14} className={agent.color} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-display font-semibold truncate ${active ? "text-diamond-text" : "text-diamond-muted"}`}>{agent.name}</p>
                  {hasConversation && <p className="text-[10px] text-diamond-gold font-body">En cours</p>}
                </div>
              </div>
            </button>
          );
        })}

        {/* Data indicator */}
        <div className="hidden lg:flex items-center gap-2 mt-auto pt-3 border-t border-diamond-border">
          <div className={`w-1.5 h-1.5 rounded-full ${dataLoaded ? "bg-emerald-500" : "bg-amber-400"}`} />
          <div className="flex items-center gap-1 text-[10px] text-diamond-muted font-body">
            <Database size={10} />
            CRM connecté · {totalLeads} leads · {clients.length} clients
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-diamond-border shadow-card overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-3.5 border-b border-diamond-border flex items-center justify-between ${activeAgent.bg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center`}>
              <Icon size={17} className={activeAgent.color} strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-display font-semibold text-diamond-text text-sm">{activeAgent.name}</p>
              <p className="text-xs text-diamond-muted font-body">{activeAgent.desc}</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-xs text-diamond-muted hover:text-diamond-text font-body flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white/70 transition-colors">
              <RefreshCw size={11} /> Réinitialiser
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div>
              <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-3xl ${activeAgent.bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon size={24} className={activeAgent.color} strokeWidth={1.5} />
                </div>
                <p className="font-display font-semibold text-diamond-text">{activeAgent.name}</p>
                <p className="text-xs text-diamond-muted font-body mt-1">{activeAgent.desc}</p>
              </div>
              <p className="text-xs text-diamond-muted font-body uppercase tracking-widest mb-3 text-center">Questions suggérées</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeAgent.prompts.map((p, i) => (
                  <button key={i} onClick={() => send(p)}
                    className="text-left text-sm font-body text-diamond-text bg-diamond-bg hover:bg-diamond-raised border border-diamond-border px-4 py-3 rounded-2xl transition-all hover:border-diamond-gold/40 hover:shadow-sm group">
                    <div className="flex items-start gap-2">
                      <ChevronRight size={13} className="text-diamond-gold mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{p}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "agent" && (
                    <div className={`w-7 h-7 rounded-2xl ${activeAgent.bg} flex items-center justify-center shrink-0 mr-2.5 mt-0.5`}>
                      <Icon size={13} className={activeAgent.color} strokeWidth={1.8} />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-diamond-text text-white rounded-br-sm"
                      : "bg-diamond-bg text-diamond-text rounded-bl-sm border border-diamond-border"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className={`w-7 h-7 rounded-2xl ${activeAgent.bg} flex items-center justify-center shrink-0 mr-2.5`}>
                    <Icon size={13} className={activeAgent.color} strokeWidth={1.8} />
                  </div>
                  <div className="bg-diamond-bg border border-diamond-border px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-diamond-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-diamond-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-diamond-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-diamond-border">
          <div className="flex gap-2 bg-diamond-bg border border-diamond-border rounded-2xl px-3 py-2 focus-within:border-diamond-gold/60 focus-within:shadow-gold transition-all">
            <input ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Demandez à ${activeAgent.name}...`}
              className="flex-1 bg-transparent text-sm font-body text-diamond-text placeholder:text-diamond-muted outline-none" />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className={`p-2 rounded-xl transition-all disabled:opacity-40 ${input.trim() ? "bg-diamond-gold text-white" : "bg-diamond-raised text-diamond-muted"}`}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <p className="text-[10px] text-diamond-muted font-body text-center mt-2">
            Connecté à votre CRM · {totalLeads} leads · {clients.length} clients · {totalCampaigns} campagnes
          </p>
        </div>
      </div>
    </div>
  );
}
