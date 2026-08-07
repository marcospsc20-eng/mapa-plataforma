'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Compass,
  Award,
  Star,
  Rocket,
  CheckCircle2,
  PiggyBank,
  TrendingUp,
  Wallet,
  Bell,
  Send,
  BookOpen,
  X,
  Gamepad2,
  Dumbbell,
  Globe2,
  Zap,
  ArrowUpRight,
  Telescope,
  Users,
  FlaskConical,
  Loader2,
} from 'lucide-react';

type MissaoApi = {
  id: string;
  title: string;
  description: string;
  skillArea: string;
  xpReward: number;
};

type MissaoCard = {
  id: string;
  titulo: string;
  area: string;
  xpRecompensa: number;
  descricao: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  tagBg: string;
};

type ProgressoApi = {
  totalXp: number;
  level: number;
};

const skillVisual: Record<
  string,
  {
    area: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    tagBg: string;
  }
> = {
  EXPLORADOR: {
    area: 'Inglês',
    icon: Globe2,
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    tagBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  },
  CRIADOR: {
    area: 'Criatividade',
    icon: Gamepad2,
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    tagBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  ATLETA: {
    area: 'Atleta',
    icon: Dumbbell,
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    tagBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  CIENTISTA: {
    area: 'Ciência',
    icon: FlaskConical,
    iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    tagBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  },
  FAMILIA: {
    area: 'Família',
    icon: Users,
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    tagBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
  LEITURA: {
    area: 'Finanças & Foco',
    icon: BookOpen,
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    tagBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
};

const defaultVisual = {
  area: 'Missão',
  icon: Star,
  iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  tagBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
};

function mapMissao(api: MissaoApi): MissaoCard {
  const visual = skillVisual[api.skillArea] || defaultVisual;

  return {
    id: api.id,
    titulo: api.title,
    area: visual.area,
    xpRecompensa: api.xpReward,
    descricao: api.description,
    icon: visual.icon,
    iconBg: visual.iconBg,
    tagBg: visual.tagBg,
  };
}

export default function Home() {
  const [iniciouAventura, setIniciouAventura] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'missoes' | 'cofre'>('missoes');

  const [missaoSelecionada, setMissaoSelecionada] = useState<MissaoCard | null>(null);
  const [respostaDiario, setRespostaDiario] = useState('');
  const [enviadoComSucesso, setEnviadoComSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [xpTotal, setXpTotal] = useState(150);
  const [nivel, setNivel] = useState(2);
  const [missoes, setMissoes] = useState<MissaoCard[]>([]);
  const [carregandoMissoes, setCarregandoMissoes] = useState(true);
  const [erroMissoes, setErroMissoes] = useState('');

  const saldoLivre = 80.0;
  const poupancaInvestida = 20.0;
  const rendimentoMes = 1.45;

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregandoMissoes(true);
        setErroMissoes('');

        const [resMissoes, resProgresso] = await Promise.all([
          fetch('/api/missoes', { cache: 'no-store' }),
          fetch('/api/progresso', { cache: 'no-store' }),
        ]);

        if (!resMissoes.ok) {
          throw new Error('Falha ao buscar missões');
        }

        const dadosMissoes: MissaoApi[] = await resMissoes.json();
        if (!ativo) return;

        setMissoes(dadosMissoes.map(mapMissao));

        if (resProgresso.ok) {
          const dadosProgresso: ProgressoApi = await resProgresso.json();
          if (!ativo) return;
          setXpTotal(dadosProgresso.totalXp);
          setNivel(dadosProgresso.level);
        }
      } catch (error) {
        console.error(error);
        if (!ativo) return;
        setErroMissoes('Não foi possível carregar as missões do banco.');
      } finally {
        if (ativo) setCarregandoMissoes(false);
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const enviarDiarioBordo = async () => {
    if (!missaoSelecionada) return;

    if (!respostaDiario.trim()) {
      return alert('Por favor, digite seu registro antes de enviar.');
    }

    try {
      setEnviando(true);

      const resposta = await fetch('/api/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: missaoSelecionada.id,
          feedbackText: respostaDiario.trim(),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados?.error || 'Falha ao enviar diário');
      }

      setEnviadoComSucesso(true);

      setTimeout(() => {
        setEnviadoComSucesso(false);
        setMissaoSelecionada(null);
        setRespostaDiario('');
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar o registro para o Neon. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {!iniciouAventura ? (
        <div className="max-w-xl w-full text-center space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex justify-center items-center gap-2 text-slate-400 font-medium text-xs tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Plataforma Codinome MAPA</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Olá, Thales</h1>
            <p className="text-slate-400 text-base">
              Sua central de missões e progresso diário está pronta.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex justify-around items-center">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-indigo-400" />
              <div className="text-left">
                <span className="block text-[11px] text-slate-500 font-semibold uppercase">
                  Nível
                </span>
                <span className="text-lg font-bold text-slate-200">{nivel} - Explorador</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-indigo-400" />
              <div className="text-left">
                <span className="block text-[11px] text-slate-500 font-semibold uppercase">
                  Total XP
                </span>
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
        <div className="max-w-4xl w-full space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Planeta do Thales</h2>
                <p className="text-slate-400 text-xs">
                  Gestão de missões, tarefas e cofre de investimento.
                </p>
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

          {abaAtiva === 'missoes' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Missões disponíveis
                </h3>
                <span className="text-xs text-slate-400">{xpTotal} XP totais</span>
              </div>

              {carregandoMissoes && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center gap-3 text-slate-300">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  Carregando missões do banco...
                </div>
              )}

              {!carregandoMissoes && erroMissoes && (
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 text-rose-200 text-sm">
                  {erroMissoes}
                </div>
              )}

              {!carregandoMissoes && !erroMissoes && missoes.length === 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-400 text-sm">
                  Nenhuma missão cadastrada no Neon ainda.
                </div>
              )}

              {!carregandoMissoes && !erroMissoes && missoes.length > 0 && (
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
                          <span
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${missao.tagBg}`}
                          >
                            {missao.area}
                          </span>
                        </div>

                        <h4 className="mt-4 text-base font-bold text-white">{missao.titulo}</h4>
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
              )}
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

      {missaoSelecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                if (enviando) return;
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
                  A missão foi gravada no Neon e enviada para validação no Observatório.
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
                  <p className="mt-2 text-sm text-slate-400">{missaoSelecionada.descricao}</p>
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
                    disabled={enviando}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 text-slate-100 p-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-60"
                  />
                </div>

                <button
                  onClick={enviarDiarioBordo}
                  disabled={enviando}
                  className="mt-4 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar para Validação
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}