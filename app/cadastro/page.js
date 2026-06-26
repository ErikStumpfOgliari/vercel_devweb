'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tipo: 'cliente',
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cpf_cnpj: '',
    cidade: '',
    estado: '',
    endereco: '',
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Erro ao criar conta.');
        return;
      }
      setSucesso('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
            <p className="text-gray-500 mt-1">Junte-se ao marketplace SoloObra</p>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
              {sucesso}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="label">Tipo de conta</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'cliente', label: '👷 Cliente', desc: 'Quero alugar máquinas' },
                  { value: 'dono', label: '🏗️ Dono', desc: 'Quero anunciar máquinas' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, tipo: opt.value }))}
                    className={`p-3 rounded-lg border-2 text-left transition ${
                      form.tipo === opt.value
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Nome completo *</label>
              <input name="nome" value={form.nome} onChange={onChange} required className="input" placeholder="João da Silva" />
            </div>

            <div>
              <label className="label">E-mail *</label>
              <input type="email" name="email" value={form.email} onChange={onChange} required className="input" placeholder="seu@email.com" />
            </div>

            <div>
              <label className="label">Senha *</label>
              <input type="password" name="senha" value={form.senha} onChange={onChange} required className="input" placeholder="Mínimo 6 caracteres" minLength={6} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Telefone</label>
                <input name="telefone" value={form.telefone} onChange={onChange} className="input" placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="label">CPF / CNPJ</label>
                <input name="cpf_cnpj" value={form.cpf_cnpj} onChange={onChange} className="input" placeholder="000.000.000-00" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cidade</label>
                <input name="cidade" value={form.cidade} onChange={onChange} className="input" placeholder="São Paulo" />
              </div>
              <div>
                <label className="label">Estado</label>
                <input name="estado" value={form.estado} onChange={onChange} className="input" placeholder="SP" maxLength={2} />
              </div>
            </div>

            <div>
              <label className="label">Endereço</label>
              <input name="endereco" value={form.endereco} onChange={onChange} className="input" placeholder="Rua, número, bairro" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-yellow-600 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
