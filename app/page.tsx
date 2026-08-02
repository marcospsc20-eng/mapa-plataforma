'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Compass, Award, Star, Rocket, CheckCircle2, 
  PiggyBank, TrendingUp, Wallet, Bell, Send, BookOpen, X, 
  Gamepad2, Dumbbell, Globe2, Zap, ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const [iniciouAventura, setIniciouAventura] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'missoes' | 'cofre'>('missoes');
  
  // Controle da Modal do Diário
  const [missaoSelecionada, setMissaoSelecionada] = useState<any>(null);
  const [respostaDiario, setRespostaDiario] = useState('');
  const [enviadoComSucesso, setEnviadoComSucesso] = useState(false);

  // Pontuação
  const [xpTotal, setXpTotal] = useState(250);

  // Missões com Ícones Destaque (Ancoragem Visual Inclusiva)
  const missoes = [
    { 
      id: 1, 
      titulo: 'MISSÃO EXPLORADOR', 
      area: 'Inglês', 
      xpRecompensa: 35, 
      descricao: 'Descubra cinco palavras novas em inglês e registre seu aprendizado.', 
      icon: Globe2,
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      tagBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
    },
    { 
      id: 2, 
      titulo: 'MISSÃO CRIADOR', 
      area: 'Criatividade', 
      xpRecompensa: 50, 
      descricao: 'Construa algo no Minecraft ou ferramenta digital e explique o processo.', 
      icon: Gamepad2,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      tagBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
    },
    { 
      id: 3, 
      titulo: 'MISSÃO ACELERADOR DE LEITURA', 
      area: 'Finanças & Foco', 
      xpRecompensa: 100, 
      descricao: 'Leia 1 livro completo este mês para desbloquear o bônus no Cofre.', 
      icon: BookOpen,
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      tagBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    },
    { 
      id: 4, 
      titulo: 'MISSÃO CORPO', 
      area: 'Atleta', 
      xpRecompensa: 30, 
      descricao: 'Pratique uma atividade física ou esporte por pelo menos 20 minutos.', 
      icon: Dumbbell,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      tagBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
    },
  ];

  const saldoLivre = 80.00;
  const poupancaInvestida = 20.00;
  const rendimentoMes = 1.45;

  const enviarDiarioBordo = () => {
    if (!respostaDiario.trim()) return alert("Por favor, digite seu registro antes de enviar.");
    
    setEnviadoComSucesso(true);
    setTimeout(() => {
      setEnviadoComSucesso(false);
      setMissaoSelecionada(null);
      setRespostaDiario('');
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      
      {!iniciouAventura ? (
        /* TELA 1: BOAS-VINDAS CLEAN E SOBRIA */
        <div className="max-w-xl w-full text-center space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex justify-center items-center gap-2 text-slate-400 font-medium text-xs tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Plataforma Codinome MAPA</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Olá, Thales
            </h1>
            <p className="text-slate-400 text-base">
              Sua central de missões e progresso diário está pronta.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex justify-around items-center">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-indigo-400" />
              <div className="text-left">
                <span className="block text-[11px] text-slate-500 font-semibold uppercase">Nível</span>
                <span className="text-lg font-bold text-slate-200">2 - Explorador</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-indigo-400" />
              <div className="text-left">
                <span className="block text-[11px] text-slate-500 font-semibold uppercase">Total XP</span>
                <span className="text-lg font-bold text-slate-200">{xpTotal} XP</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIniciouAventura(true)}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <Compass className="w-5 h-5 text-indigo-200" />
            Acessar Painel
          </button>
        </div>
      ) : (
        /* TELA 2: DASHBOARD COM ÍCONES REFINADOS E ATRAENTES */
        <div className="max-w-4xl w-full space-y-6">
          
          {/* Header Unificado */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Planeta do Thales</h2>
                <p className="text-slate-400 text-xs">Gestão de missões, tarefas e cofre de investimento.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIniciouAventura(false)}
                className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl text-slate-300 border border-slate-700/50 transition cursor-pointer"
              >
                Início
              </button>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setAbaAtiva('missoes')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${abaAtiva === 'missoes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Missões
                </button>
                <button 
                  onClick={() => setAbaAtiva('cofre')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${abaAtiva === 'cofre' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <PiggyBank className="w-4 h-4" /> Cofre
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE MISSÕES COM ÍCONES DESTACADOS */}
          {abaAtiva === 'missoes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missoes.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={item.id} 
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition space-y-4 shadow-md"
                  >
                    <div>
                      {/* Topo do Card com Ícone Destacado */}
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl border ${item.iconBg} shadow-inner`}>
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${item.tagBg}`}>
                            {item.area}
                          </span>
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                            +{item.xpRecompensa} XP
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1.5">{item.titulo}</h3>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.descricao}</p>
                    </div>

                    <button 
                      onClick={() => setMissaoSelecionada(item)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Registrar no Diário
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* COFRE ESPACIAL SOBRIO */}
          {abaAtiva === 'cofre' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* USO LIVRE */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-slate-400">
                      <Wallet className="w-4 h-4 text-indigo-400" /> Uso Livre (80%)
                    </span>
                    <span className="text-[11px] bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md text-slate-300">Gastos Pessoais</span>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-white">R$ {saldoLivre.toFixed(2)}</span>
                    <p className="text-xs text-slate-400 mt-1">Saldo acumulado para saques ou compras autorizadas.</p>
                  </div>
                </div>

                {/* POUPANÇA */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-slate-400">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Poupança Orbital (20%)
                    </span>
                    <span className="text-[11px] bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-md text-slate-300">Investimento</span>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-white">R$ {poupancaInvestida.toFixed(2)}</span>
                    <p className="text-xs text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Rendimento do mês: +R$ {rendimentoMes.toFixed(2)}
                    </p>
                  </div>
                </div>

              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
                <h3 className="text-base font-bold text-white">Solicitação de Mesada</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto">
                  Após concluir o ciclo de missões, envie uma notificação para validação dos pais no Observatório.
                </p>
                <button 
                  onClick={() => alert("Notificação enviada com sucesso para o Observatório!")}
                  className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Bell className="w-4 h-4" /> Solicitar Transferência de Saldo
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* JANELA MODAL DO DIÁRIO */}
      {missaoSelecionada && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full p-6 rounded-2xl space-y-4 shadow-2xl relative">
            
            <button 
              onClick={() => setMissaoSelecionada(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {enviadoComSucesso ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Registro Enviado</h3>
                <p className="text-slate-400 text-xs">Aguardando aprovação no Observatório da Família.</p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Registro de Missão
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{missaoSelecionada.titulo}</h3>
                  <p className="text-xs text-slate-400">{missaoSelecionada.descricao}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Resumo do que foi realizado:
                  </label>
                  <textarea 
                    rows={4}
                    value={respostaDiario}
                    onChange={(e) => setRespostaDiario(e.target.value)}
                    placeholder="Digite aqui o que você aprendeu ou realizou nesta missão..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button 
                  onClick={enviarDiarioBordo}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar para Validação
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </main>
  );
}