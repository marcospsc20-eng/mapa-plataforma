'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Compass, Award, Star, Rocket, CheckCircle2, 
  PiggyBank, TrendingUp, Wallet, Bell, Send, BookOpen, X, 
  Gamepad2, Dumbbell, Globe2, Zap, ArrowUpRight, Telescope
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

  // Missões com Ícones Destaque
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
        /* TELA 1: BOAS-VINDAS */
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

          <a
            href="/observatorio"
            className="w-full py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 shadow-md transition flex items-center justify-center gap-2 text-base"
          >
            <Telescope className="w-5 h-5 text-indigo-300" />
            Abrir Observatório
          </a>
        </div>
      ) : (
        /* TELA 2: DASHBOARD */
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

            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={() => setIniciouAventura(false)}
                className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl text-slate-300 border border-slate-700/50 transition cursor-pointer"
              >
                Início
              </button>

              <a
                href="/observatorio"
                className="text-xs font-medium bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-xl text-white border border-indigo-500/50 transition"
              >
                Observatório
              </a>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setAbaAtiva('missoes')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    abaAtiva === 'missoes' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Missões
                </button>
                <button 
                  onClick={() => setAbaAtiva('cofre')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    abaAtiva === 'cofre' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cofre
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo das abas */}
          {abaAtiva === 'missoes' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Missões disponíveis
                </h3>
                <span className="text-xs text-slate-400">{xpTotal} XP totais</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missoes.map((missao) => {
                  const Icone = missao.icon;
                  return (
                    <button
                      key={missao.id}
                      onClick={() => setMissaoSelecionada(missao)}
                      className="text-left bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition shadow-lg cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`p-3 rounded-xl border ${missao.iconBg}`}>
                          <Icone className="w-5 h-5" />
                        </div>
                        <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${missao.tagBg}`}>
                          {missao.area}
                        </span>
                      </div>

                      <h4 className="mt-4 text-base font-bold text-white">
                        {missao.titulo}
                      </h4>
                      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                        {missao.descricao}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-indigo-300 text-sm font-semibold">
                          +{missao.xpRecompensa} XP
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          Registrar
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Cofre do Thales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
                    <Wallet className="w-4 h-4" />
                    Saldo livre
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    R$ {saldoLivre.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
                    <PiggyBank className="w-4 h-4" />
                    Poupança investida
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    R$ {poupancaInvestida.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    Rendimento do mês
                  </div>
                  <p className="mt-3 text-2xl font-bold text-emerald-400">
                    + R$ {rendimentoMes.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Regra da mesada</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      80% fica livre para uso e 20% vai para a poupança. O Observatório dos pais
                      acompanha as transferências e o progresso das missões.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal do Diário de Bordo */}
      {missaoSelecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setMissaoSelecionada(null);
                setRespostaDiario('');
                setEnviadoComSucesso(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {enviadoComSucesso ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Registro enviado!</h3>
                <p className="text-slate-400 text-sm">
                  A missão foi enviada para validação no Observatório.
                </p>
              </div>
            ) : (
              <>
                <div className="pr-8">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    Diário de bordo
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-white">
                    {missaoSelecionada.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {missaoSelecionada.descricao}
                  </p>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    O que você fez nesta missão?
                  </label>
                  <textarea
                    value={respostaDiario}
                    onChange={(e) => setRespostaDiario(e.target.value)}
                    rows={5}
                    placeholder="Escreva aqui seu registro..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 text-slate-100 p-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={enviarDiarioBordo}
                  className="mt-4 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Enviar para Validação
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </main>
  );
}