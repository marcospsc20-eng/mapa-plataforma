'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Zap,
  Award,
  X,
  Lock,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

type ProgressoThales = {
  userId: string;
  name: string;
  totalXp: number;
  level: number;
  xpExplorador: number;
  xpCriador: number;
  xpAtleta: number;
  xpCientista: number;
};

type MissaoPendente = {
  id: string;
  titulo: string;
  area: string;
  xp: number;
  filho: string;
  feedbackText?: string | null;
  missionId: string;
  userId: string;
};

type TransferenciaMesada = {
  id: string;
  amountFree: number;
  amountSave: number;
  status: string;
  requestedAt: string;
  completedAt: string | null;
  note: string | null;
};

type ToastState = {
  tipo: 'sucesso' | 'erro';
  titulo: string;
  mensagem: string;
} | null;

const areaLabel: Record<string, string> = {
  EXPLORADOR: 'Inglês',
  CRIADOR: 'Criatividade',
  ATLETA: 'Atleta',
  CIENTISTA: 'Ciência',
  FAMILIA: 'Família',
  LEITURA: 'Finanças & Foco',
};

function formatarReais(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function Observatorio() {
  const [autenticado, setAutenticado] = useState(false);
  const [checandoSessao, setChecandoSessao] = useState(true);
  const [pin, setPin] = useState('');
  const [erroPin, setErroPin] = useState('');
  const [entrando, setEntrando] = useState(false);

  const [progresso, setProgresso] = useState<ProgressoThales | null>(null);
  const [missoesParaAprovar, setMissoesParaAprovar] = useState<MissaoPendente[]>([]);
  const [mesadaPendente, setMesadaPendente] = useState<TransferenciaMesada | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aprovandoId, setAprovandoId] = useState<string | null>(null);
  const [confirmandoMesada, setConfirmandoMesada] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  function mostrarToast(tipo: 'sucesso' | 'erro', titulo: string, mensagem: string) {
    setToast({ tipo, titulo, mensagem });
    window.setTimeout(() => {
      setToast(null);
    }, 4500);
  }

  async function verificarSessao() {
    try {
      setChecandoSessao(true);
      const res = await fetch('/api/auth/responsavel', { cache: 'no-store' });
      if (!res.ok) {
        setAutenticado(false);
        return;
      }
      const dados = await res.json();
      setAutenticado(Boolean(dados?.ok || dados?.authenticated));
    } catch (error) {
      console.error(error);
      setAutenticado(false);
    } finally {
      setChecandoSessao(false);
    }
  }

  async function entrarComPin() {
    try {
      setEntrando(true);
      setErroPin('');

      const res = await fetch('/api/auth/responsavel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErroPin(dados?.error || 'PIN incorreto');
        setAutenticado(false);
        return;
      }

      setAutenticado(true);
      setPin('');
    } catch (error) {
      console.error(error);
      setErroPin('Não foi possível validar o PIN agora.');
      setAutenticado(false);
    } finally {
      setEntrando(false);
    }
  }

  async function sair() {
    try {
      await fetch('/api/auth/responsavel', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setAutenticado(false);
      setPin('');
    }
  }

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro('');

      const [resProgresso, resDiario, resMesada] = await Promise.all([
        fetch('/api/progresso', { cache: 'no-store' }),
        fetch('/api/diario', { cache: 'no-store' }),
        fetch('/api/mesada', { cache: 'no-store' }),
      ]);

      if (!resProgresso.ok) {
        throw new Error('Falha ao buscar progresso');
      }

      if (!resDiario.ok) {
        throw new Error('Falha ao buscar diário pendente');
      }

      const dadosProgresso: ProgressoThales = await resProgresso.json();
      const dadosDiario: MissaoPendente[] = await resDiario.json();

      setProgresso(dadosProgresso);
      setMissoesParaAprovar(Array.isArray(dadosDiario) ? dadosDiario : []);

      if (resMesada.ok) {
        const dadosMesada = await resMesada.json();
        if (dadosMesada?.hasPending && dadosMesada?.transfer) {
          setMesadaPendente(dadosMesada.transfer);
        } else {
          setMesadaPendente(null);
        }
      } else {
        // Se a API de mesada ainda não estiver no ar, não quebra o Observatório
        setMesadaPendente(null);
      }
    } catch (error) {
      console.error(error);
      setErro('Não foi possível carregar os dados reais do Neon.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    verificarSessao();
  }, []);

  useEffect(() => {
    if (autenticado) {
      carregarDados();
    }
  }, [autenticado]);

  const aprovarMissao = async (item: MissaoPendente) => {
    try {
      setAprovandoId(item.id);

      const resposta = await fetch('/api/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xpAdicional: item.xp,
          logId: item.id,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(resultado?.error || 'Falha ao creditar XP');
      }

      setMissoesParaAprovar((lista) => lista.filter((m) => m.id !== item.id));
      await carregarDados();

      mostrarToast(
        'sucesso',
        'Missão aprovada',
        `+${item.xp} XP creditados ao Thales. Total agora: ${resultado.totalXp} XP (nível ${resultado.level}).`
      );
    } catch (error) {
      console.error(error);
      mostrarToast(
        'erro',
        'Não foi possível aprovar',
        'Erro ao aprovar a missão no banco. Tente de novo em instantes.'
      );
    } finally {
      setAprovandoId(null);
    }
  };

  const confirmarTransferencia = async () => {
    if (!mesadaPendente || confirmandoMesada) return;

    try {
      setConfirmandoMesada(true);

      const resposta = await fetch('/api/mesada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirmar',
          transferId: mesadaPendente.id,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados?.error || 'Falha ao confirmar mesada');
      }

      setMesadaPendente(null);

      mostrarToast(
        'sucesso',
        'Transferência confirmada',
        dados?.alreadyCompleted
          ? 'Esta mesada já estava marcada como concluída.'
          : 'Mesada marcada como feita no Neon.'
      );

      await carregarDados();
    } catch (error) {
      console.error(error);
      mostrarToast(
        'erro',
        'Não foi possível confirmar',
        'Erro ao gravar a confirmação da mesada. Tente de novo.'
      );
    } finally {
      setConfirmandoMesada(false);
    }
  };

  if (checandoSessao) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          Verificando acesso do Responsável...
        </div>
      </main>
    );
  }

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white">Área do Responsável</h1>
            <p className="text-sm text-slate-400">
              Digite o PIN da família para abrir o Observatório.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') entrarComPin();
              }}
              placeholder="••••"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-2xl tracking-[0.4em] py-3 outline-none focus:border-emerald-500"
            />
            {erroPin && (
              <p className="text-sm text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2">
                {erroPin}
              </p>
            )}
          </div>

          <button
            onClick={entrarComPin}
            disabled={entrando || pin.length < 4}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold transition flex items-center justify-center gap-2"
          >
            {entrando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar no Observatório'
            )}
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/90 p-6 rounded-3xl border border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Painel de Controle dos Pais</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Observatório da Família</h1>
            <p className="text-slate-400 text-sm">
              Acompanhamento, aprovações e gestão da mesada do Thales.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={sair}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao App do Thales
            </Link>
          </div>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Progresso real do Thales (Neon)
          </h2>

          {carregando && (
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              Carregando dados do banco...
            </div>
          )}

          {!carregando && erro && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-4 text-rose-200 text-sm">
              {erro}
            </div>
          )}

          {!carregando && !erro && progresso && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Total XP
                </span>
                <p className="mt-2 text-2xl font-bold text-white">{progresso.totalXp} XP</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Nível</span>
                <p className="mt-2 text-2xl font-bold text-white">{progresso.level}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Explorador</span>
                <p className="mt-2 text-2xl font-bold text-cyan-300">{progresso.xpExplorador}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold uppercase">Criador</span>
                <p className="mt-2 text-2xl font-bold text-purple-300">{progresso.xpCriador}</p>
              </div>
            </div>
          )}
        </div>

        {mesadaPendente ? (
          <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 animate-bounce" />
              <h2 className="text-xl font-bold">Solicitação de Transferência Recebida!</h2>
            </div>
            <p className="text-slate-300 text-sm">
              O Thales pediu a mesada. Depois de fazer a transferência manual,
              marque aqui como concluída.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold block">
                  CONTA LIVRE (80%)
                </span>
                <span className="text-2xl font-bold text-blue-400">
                  {formatarReais(Number(mesadaPendente.amountFree || 0))}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Transferência manual para a conta livre do Thales.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold block">
                  POUPANÇA ORBITAL (20%)
                </span>
                <span className="text-2xl font-bold text-purple-400">
                  {formatarReais(Number(mesadaPendente.amountSave || 0))}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Aplicar na poupança/investimento do Thales.
                </p>
              </div>
            </div>

            {mesadaPendente.note && (
              <p className="text-xs text-slate-400">
                Observação: {mesadaPendente.note}
              </p>
            )}

            <button
              onClick={confirmarTransferencia}
              disabled={confirmandoMesada}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer w-full sm:w-auto"
            >
              {confirmandoMesada ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirmar Transferência Realizada
                </>
              )}
            </button>
          </div>
        ) : (
          !carregando && (
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-slate-300 text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-slate-500" />
              <span>Nenhuma solicitação de mesada pendente no momento.</span>
            </div>
          )
        )}

        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Missões Aguardando Validação
          </h2>

          {carregando && (
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              Buscando envios do diário no Neon...
            </div>
          )}

          {!carregando && missoesParaAprovar.length === 0 ? (
            <p className="text-slate-400 text-sm italic">
              Nenhuma missão aguardando validação agora.
            </p>
          ) : (
            <div className="space-y-3">
              {missoesParaAprovar.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-400">
                      {areaLabel[m.area] || m.area}
                    </span>
                    <h3 className="font-bold text-white">{m.titulo}</h3>
                    <p className="text-xs text-slate-400">
                      {m.filho} · Recompensa: +{m.xp} XP
                    </p>
                    {m.feedbackText && (
                      <p className="text-sm text-slate-300 mt-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
                        “{m.feedbackText}”
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => aprovarMissao(m)}
                    disabled={aprovandoId === m.id}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    {aprovandoId === m.id ? 'Validando...' : 'Validar e Conceder XP'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] w-[min(92vw,24rem)] animate-in fade-in">
          <div
            className={`rounded-2xl border shadow-2xl p-4 flex items-start gap-3 ${
              toast.tipo === 'sucesso'
                ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-50'
                : 'bg-rose-950/95 border-rose-500/40 text-rose-50'
            }`}
          >
            <div className="mt-0.5">
              {toast.tipo === 'sucesso' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{toast.titulo}</p>
              <p className="text-sm opacity-90 mt-1 leading-relaxed">{toast.mensagem}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/60 hover:text-white transition shrink-0"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}