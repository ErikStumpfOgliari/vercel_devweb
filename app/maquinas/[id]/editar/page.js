'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../../lib/api.js';

const TIPOS_MAQUINA = [
  'Escavadeira', 'Retroescavadeira', 'Trator', 'Betoneira', 'Guindaste',
  'Compactador', 'Caminhão Basculante', 'Plataforma Elevatória', 'Motoniveladora', 'Outro',
];

export default function EditarMaquinaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [loadingDados, setLoadingDados] = useState(true);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('usuario');
    if (!token || !u) { router.push('/login'); return; }
    carregarMaquina();
  }, [id]);

  async function carregarMaquina() {
    try {
      const res = await fetch(`/api/maquinas/${id}`);
      if (!res.ok) { setErro('Máquina não encontrada.'); return; }
      const data = await res.json();

      const u = localStorage.getItem('usuario');
      if (u) {
        const parsed = JSON.parse(u);
        if (data.id_proprietario !== parsed.id) {
          alert('Você não tem permissão para editar esta máquina.');
          router.push('/dashboard');
          return;
        }
      }

      setForm({
        nome: data.nome || '',
        tipo_maquina: data.tipo_maquina || '',
        descricao: data.descricao || '',
        preco_diaria: data.preco_diaria || '',
        localizacao: data.localizacao || '',
        img_url: data.img_url || '',
        disponibilidade: data.disponibilidade !== false,
      });
    } catch {
      setErro('Erro ao carregar máquina.');
    } finally {
      setLoadingDados(false);
    }
  }

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
      const res = await apiFetch(`/api/maquinas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Erro ao atualizar.');
        return;
      }
      router.push(`/maquinas/${id}`);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (loadingDados) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (erro && !form) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-xl text-gray-700">{erro}</p>
        <Link href="/dashboard" className="btn-primary inline-block mt-4">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href={`/maquinas/${id}`} className="text-sm text-yellow-600 hover:underline mb-4 inline-block">
        ← Voltar ao anúncio
      </Link>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Máquina</h1>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
            {erro}
          </div>
        )}

        {form && (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label">Nome da máquina *</label>
              <input name="nome" value={form.nome} onChange={onChange} required className="input" />
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
                required min="0" step="0.01" className="input"
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
              <Link href={`/maquinas/${id}`} className="btn-secondary flex-1 text-center">
                Cancelar
              </Link>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
