'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, Rocket } from 'lucide-react';

export default function Cadastro() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [cadastrando, setCadastrando] = useState(false);

  const camposPreenchidos =
    familyName.trim() && parentName.trim() && childName.trim() && email.trim() && senha;

  async function cadastrar() {
    if (!camposPreenchidos) return;

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não são iguais.');
      return;
    }

    try {
      setCadastrando(true);
      setErro('');

      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyName: familyName.trim(),
          parentName: parentName.trim(),
          childName: childName.trim(),
          email: email.trim(),
          password: senha,
        }),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados?.error || 'Não foi possível cadastrar a família.');
        return;
      }

      router.push('/');
    } catch (error) {
      console.error(error);
      setErro('Não foi possível cadastrar agora. Tente de novo.');
    } finally {
      setCadastrando(false);
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
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar minha família</h1>
          <p className="text-sm text-slate-400">
            Leva menos de um minuto. Você poderá personalizar tudo depois.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Nome da família
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Ex.: Família Silva"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white py-3 px-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Seu nome</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Ex.: Ana"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white py-3 px-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Nome da criança
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Ex.: Sofia"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white py-3 px-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Seu e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white py-3 px-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Pelo menos 6 caracteres"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white py-3 px-4 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') cadastrar();
              }}
              placeholder="Digite a senha de novo"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white py-3 px-4 outline-none focus:border-emerald-500"
            />
          </div>

          {erro && (
            <p className="text-sm text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2">
              {erro}
            </p>
          )}
        </div>

        <button
          onClick={cadastrar}
          disabled={cadastrando || !camposPreenchidos}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold transition flex items-center justify-center gap-2"
        >
          {cadastrando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Criando família...
            </>
          ) : (
            'Criar minha família'
          )}
        </button>

        <div className="space-y-3 text-center text-xs text-slate-400">
          <p>
            Já tem uma família cadastrada?{' '}
            <Link href="/entrar" className="text-emerald-300 hover:text-emerald-200 font-semibold">
              Entrar
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
