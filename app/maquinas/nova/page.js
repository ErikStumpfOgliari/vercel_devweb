'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api.js';

const TIPOS_MAQUINA = [
  'Escavadeira', 'Retroescavadeira', 'Trator', 'Betoneira', 'Guindaste',
  'Compactador', 'Caminhão Basculante', 'Plataforma Elevatória', 'Motoniveladora', 'Outro',
];

const CAMPOS_INICIAIS = {
  nome: '', tipo_maquina: '', descricao: '', preco_diaria: '',
  localizacao: '', img_url: '', disponibilidade: true,
};

export default function NovaMaquinaPage() {
  const router = useRouter();
  const [form, setForm] = useState(CAMPOS_INICIAIS);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    if (!u || !token) { router.push('/login'); return; }
    const parsed = JSON.parse(u);
    if (parsed.tipo !== 'dono') {
      alert('Apenas donos podem anunciar máquinas.');
      router.push('/dashboard');
    }
  }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const payload = { ...form, preco_diaria: Number(form.preco_diaria) };
      const res = await apiFetch('/api/maquinas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Erro ao cadastrar máquina.');
        return;
      }
      router.push('/dashboard');
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="text-sm text-yellow-600 hover:underline mb-4 inline-block">
        ← Voltar ao dashboard
      </Link>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Anunciar Máquina</h1>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">Nome da máquina *</label>
            <input name="nome" value={form.nome} onChange={onChange} required className="input" placeholder="Ex: Escavadeira Caterpillar 320" />
          </div>

          <div>
            <label className="label">Tipo de máquina *</label>
            <select name="tipo_maquina" value={form.tipo_maquina} onChange={onChange} required className="input">
              <option value="">Selecione o tipo...</option>
              {TIPOS_MAQUINA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Preço por dia (R$) *</label>
            <input
              type="number" name="preco_diaria" value={form.preco_diaria} onChange={onChange}
              required min="0" step="0.01" placeholder="Ex: 450.00" className="input"
            />
          </div>

          <div>
            <label className="label">Localização</label>
            <input name="localizacao" value={form.localizacao} onChange={onChange} className="input" placeholder="Ex: São Paulo — SP" />
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea
              name="descricao" value={form.descricao} onChange={onChange}
              rows={4} className="input resize-none"
              placeholder="Descreva o estado, capacidade e outras informações relevantes..."
            />
          </div>

          <div>
            <label className="label">URL da imagem</label>
            <input name="img_url" value={form.img_url} onChange={onChange} type="url" className="input" placeholder="https://..." />
            {form.img_url && (
              <div className="mt-2 h-32 rounded-lg overflow-hidden border border-gray-200">
                <img src={form.img_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="disponibilidade" name="disponibilidade"
              checked={form.disponibilidade} onChange={onChange}
              className="w-4 h-4 accent-yellow-500"
            />
            <label htmlFor="disponibilidade" className="text-sm font-medium text-gray-700 cursor-pointer">
              Máquina disponível para aluguel
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/dashboard" className="btn-secondary flex-1 text-center">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Cadastrando...' : 'Cadastrar Máquina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
