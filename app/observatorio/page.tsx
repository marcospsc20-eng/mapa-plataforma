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

export default function Observatorio() {
  const [solicitacaoPendente, setSolicitacaoPendente] = useState(true);
  const [transferenciaConfirmada, setTransferenciaConfirmada] = useState(false);

  const [progresso, setProgresso] = useState<ProgressoThales | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aprovando, setAprovando] = useState(false);

  // Lista de validação ainda local nesta etapa.
  // No próximo passo ligamos ao diário/MissionLog do Neon.
  const [missoesParaAprovar, setMissoesParaAprovar] = useState<
    { id: string; titulo: string; area: string; xp: number; filho: string }[]
  >([]);

  async function carregarProgresso() {
    try {
      setCarregando(true);
      setErro('');

      const resposta = await fetch('/api/progresso', { cache: 'no-store' });
      if (!resposta.ok) {
        throw new Error('Falha ao buscar progresso');
      }

      const dados: ProgressoThales = await resposta.json();
      setProgresso(dados);
    } catch (error) {
      console.error(error);
      setErro('Não foi possível carregar o progresso do Thales no Neon.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProgresso();
  }, []);

  const aprovarMissao = async (id: string, xp: number) => {
    try {
      setAprovando(true);

      const resposta = await fetch('/api/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpAdicional: xp }),
      });

      if (!resposta.ok) {
        throw new Error('Falha ao creditar XP');
      }

      const resultado = await resposta.json();

      setMissoesParaAprovar((lista) => lista.filter((m) => m.id !== id));
      await carregarProgresso();

      alert(
        `Missão aprovada! +${xp} XP creditados ao Thales.\nTotal agora: ${resultado.totalXp} XP (nível ${resultado.level}).`
      );
    } catch (error) {
      console.error(error);
      alert('Erro ao aprovar missão no banco.');
    } finally {
      setAprovando(false);
    }
  };

  const confirmarTransferencia = () => {
    setSolicitacaoPendente(false);
    setTransferenciaConfirmada(true);
  };

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

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao App do Thales
          </Link>
        </div>

        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Progresso real do Thales (Neon)
          </h2>

          {carregando && (
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              Carregando progresso do banco...
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

        {solicitacaoPendente ? (
          <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 animate-bounce" />
              <h2 className="text-xl font-bold">Solicitação de Transferência Recebida!</h2>
            </div>
            <p className="text-slate-300 text-sm">
              O Thales concluiu o ciclo de missões do mês e solicitou o envio da mesada para a conta
              bancária.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold block">CONTA LIVRE (80%)</span>
                <span className="text-2xl font-bold text-blue-400">R$ 80,00</span>
                <p className="text-xs text-slate-400 mt-1">
                  Enviar para a conta de gastos (NextJoy / Bradesco).
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold block">
                  POUPANÇA ORBITAL (20%)
                </span>
                <span className="text-2xl font-bold text-purple-400">R$ 20,00</span>
                <p className="text-xs text-slate-400 mt-1">
                  Aplicar na poupança/investimento do Thales.
                </p>
              </div>
            </div>

            <button
              onClick={confirmarTransferencia}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer w-full sm:w-auto"
            >
              <CheckCircle className="w-5 h-5" /> Confirmar Transferência Realizada
            </button>
          </div>
        ) : (
          transferenciaConfirmada && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>
                Transferência de mesada deste mês foi marcada como <strong>concluída</strong>.
              </span>
            </div>
          )
        )}

        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Missões Aguardando Validação
          </h2>

          {missoesParaAprovar.length === 0 ? (
            <p className="text-slate-400 text-sm italic">
              Nenhuma missão aguardando validação agora. No próximo passo, o diário do Thales vai
              gravar envios reais no Neon e eles aparecem aqui.
            </p>
          ) : (
            <div className="space-y-3">
              {missoesParaAprovar.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 gap-4"
                >
                  <div>
                    <span className="text-xs font-bold text-indigo-400">{m.area}</span>
                    <h3 className="font-bold text-white">{m.titulo}</h3>
                    <p className="text-xs text-slate-400">Recompensa: +{m.xp} XP</p>
                  </div>
                  <button
                    onClick={() => aprovarMissao(m.id, m.xp)}
                    disabled={aprovando}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    {aprovando ? 'Validando...' : 'Validar e Conceder XP'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}