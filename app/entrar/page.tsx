'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) return;

    try {
      setEntrando(true);
      setErro('');

      const res = await fetch('/api/auth/responsavel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados?.error || 'E-mail ou senha incorretos.');
        return;
      }

      router.push('/');
    } catch (error) {
      console.error(error);
      setErro('Não foi possível entrar agora. Tente de novo.');
    } finally {
      setEntrando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center items-center gap-2 text-slate-400 font-medium text-xs tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>THAJU</span>
          </div>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">Entrar</h1>
          <p className="text-sm text-slate-400">
            Entre com o e-mail e a senha da sua família.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') entrar();
              }}
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white py-3 px-4 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') entrar();
              }}
              placeholder="••••••••"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white py-3 px-4 outline-none focus:border-indigo-500"
            />
          </div>

          {erro && (
            <p className="text-sm text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2">
              {erro}
            </p>
          )}
        </div>

        <button
          onClick={entrar}
          disabled={entrando || !email.trim() || !senha}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold transition flex items-center justify-center gap-2"
        >
          {entrando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>

        <div className="space-y-3 text-center text-xs text-slate-400">
          <p>
            Ainda não tem família cadastrada?{' '}
            <Link href="/cadastro" className="text-indigo-300 hover:text-indigo-200 font-semibold">
              Criar minha família
            </Link>
          </p>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
