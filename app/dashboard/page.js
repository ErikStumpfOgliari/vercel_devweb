'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api.js';

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    if (!u || !token) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(u);
    setUsuario(parsed);
    if (parsed.tipo === 'dono') carregarMaquinas();
    else setLoading(false);
  }, []);

  async function carregarMaquinas() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/maquinas/minhas');
      const data = await res.json();
      setMaquinas(Array.isArray(data) ? data : []);
    } catch {
      setMaquinas([]);
    } finally {
      setLoading(false);
    }
  }

  async function deletarMaquina(id) {
    if (!confirm('Tem certeza que deseja remover esta máquina?')) return;
    setDeletando(id);
    try {
      const res = await apiFetch(`/api/maquinas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMaquinas((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await res.json();
        alert(data.erro || 'Erro ao remover.');
      }
    } catch {
      alert('Erro de conexão.');
    } finally {
      setDeletando(null);
    }
  }

  if (!usuario) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Olá, <strong>{usuario.nome}</strong>!{' '}
            <span className="capitalize bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium ml-1">
              {usuario.tipo}
            </span>
          </p>
        </div>
        {usuario.tipo === 'dono' && (
          <Link href="/maquinas/nova" className="btn-primary">
            + Anunciar Máquina
          </Link>
        )}
      </div>

      {/* Cards de info do usuário */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Nome" value={usuario.nome} />
        <InfoCard label="E-mail" value={usuario.email} />
        <InfoCard label="Cidade" value={usuario.cidade ? `${usuario.cidade} — ${usuario.estado || ''}` : '—'} />
      </div>

      {usuario.tipo === 'dono' ? (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Minhas Máquinas ({maquinas.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Carregando...
            </div>
          ) : maquinas.length === 0 ? (
            <div className="card p-10 text-center text-gray-500">
              <p className="text-4xl mb-3">🚜</p>
              <p className="font-medium mb-2">Você ainda não anunciou nenhuma máquina.</p>
              <Link href="/maquinas/nova" className="btn-primary inline-block mt-2">
                Anunciar minha primeira máquina
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {maquinas.map((m) => (
                <MaquinaAdminCard
                  key={m.id}
                  maquina={m}
                  onDelete={() => deletarMaquina(m.id)}
                  deletando={deletando === m.id}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">👷</p>
          <p className="font-medium mb-1">Você está cadastrado como Cliente.</p>
          <p className="text-sm mb-4">Explore as máquinas disponíveis e entre em contato com os donos.</p>
          <Link href="/" className="btn-primary inline-block">
            Ver Máquinas Disponíveis
          </Link>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-semibold text-gray-800 truncate">{value || '—'}</p>
    </div>
  );
}

function MaquinaAdminCard({ maquina, onDelete, deletando }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-36 bg-gray-100 relative">
        {maquina.img_url ? (
          <img src={maquina.img_url} alt={maquina.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🏗️</div>
        )}
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
          maquina.disponibilidade ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {maquina.disponibilidade ? 'Disponível' : 'Indisponível'}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-yellow-600 font-semibold uppercase mb-0.5">{maquina.tipo_maquina}</p>
        <h3 className="font-bold text-gray-900 truncate mb-1">{maquina.nome}</h3>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          R$ {Number(maquina.preco_diaria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia
        </p>
        <div className="flex gap-2">
          <Link
            href={`/maquinas/${maquina.id}/editar`}
            className="flex-1 text-center text-sm btn-secondary py-1.5 px-3"
          >
            Editar
          </Link>
          <button
            onClick={onDelete}
            disabled={deletando}
            className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-1.5 px-3 rounded-lg border border-red-200 transition disabled:opacity-50"
          >
            {deletando ? '...' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  );
}
