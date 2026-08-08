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
  ShieldCheck,
  ArrowLeft,
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

type PapelAtivo = 'escolha' | 'explorador';

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
  const [papelAtivo, setPapelAtivo] = useState<PapelAtivo>('escolha');
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
      {papelAtivo === 'escolha' ? (
        <div className="max-w-xl w-full text-center space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex justify-center items-center gap-2 text-slate-400 font-medium text-xs tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>THAJU · Método MAPA</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Quem está entrando?
            </h1>
            <p className="text-slate-400 text-base">
              Cada papel tem um caminho diferente. O Explorador registra missões.
              O Responsável valida e cuida das regras da casa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <button
              onClick={() => {
                setPapelAtivo('explorador');
                setAbaAtiva('missoes');
              }}
              className="group bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition cursor-pointer text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Explorador</h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Painel do Thales: missões, diário de bordo e cofre.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-300">
                Entrar nas missões
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <a
              href="/observatorio"
              className="group bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Responsável</h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Observatório da Família: validar missões, mesada e progresso real.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                Abrir Observatório
                <Telescope className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            No próximo passo vamos colocar um PIN só para o Responsável.
            Assim o Explorador não consegue validar a própria missão.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl w-full space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-indigo-300 mb-1">
                  Área do Explorador
                </div>
                <h2 className="text-xl font-bold text-white">Planeta do Thales</h2>
                <p className="text-slate-400 text-xs">
                  Missões, diário de bordo e cofre de investimento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setPapelAtivo('escolha')}
                className="text-xs font-medium bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl text-slate-300 border border-slate-700/50 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Trocar perfil
              </button>

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

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold uppercase">
                  Nível
                </span>
                <span className="text-sm font-bold text-slate-200">
                  {nivel} - Explorador
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold uppercase">
                  Total XP
                </span>
                <span className="text-sm font-bold text-slate-200">{xpTotal} XP</span>
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
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Cofre do Thales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
                      <Wallet className="w-4 h-4" />
                      Uso livre (80%)
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-lg border border-slate-700 text-slate-400">
                      Gastos pessoais
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    R$ {saldoLivre.toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Saldo acumulado para saques ou compras autorizadas.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      Poupança orbital (20%)
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-lg border border-slate-700 text-slate-400">
                      Investimento
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    R$ {poupancaInvestida.toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs text-emerald-400">
                    Rendimento do mês: +R$ {rendimentoMes.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Solicitação de Mesada</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      Depois de concluir o ciclo de missões, o Explorador pede a
                      transferência. Só o Responsável confirma no Observatório.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(
                      'Pedido registrado na tela. No próximo passo ligamos isso de verdade no Neon.'
                    )
                  }
                  className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  Solicitar Transferência de Saldo
                </button>
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
                  A missão foi gravada no Neon e enviada para validação no
                  Observatório.
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