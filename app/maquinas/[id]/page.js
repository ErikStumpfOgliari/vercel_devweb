'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api.js';

export default function MaquinaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [maquina, setMaquina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('usuario');
    if (u) {
      try { setUsuarioAtual(JSON.parse(u)); } catch { /* ignore */ }
    }
    carregarMaquina();
  }, [id]);

  async function carregarMaquina() {
    setLoading(true);
    try {
      const res = await fetch(`/api/maquinas/${id}`);
      if (!res.ok) {
        setErro('Máquina não encontrada.');
        return;
      }
      const data = await res.json();
      setMaquina(data);
    } catch {
      setErro('Erro ao carregar máquina.');
    } finally {
      setLoading(false);
    }
  }

  async function deletar() {
    if (!confirm('Tem certeza que deseja remover esta máquina?')) return;
    setDeletando(true);
    try {
      const res = await apiFetch(`/api/maquinas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        alert(data.erro || 'Erro ao remover.');
      }
    } catch {
      alert('Erro de conexão.');
    } finally {
      setDeletando(false);
    }
  }

  const eProprietario = usuarioAtual && maquina && usuarioAtual.id === maquina.id_proprietario;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (erro || !maquina) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{erro || 'Máquina não encontrada'}</h2>
        <Link href="/" className="btn-primary inline-block mt-4">Voltar ao início</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-yellow-600 hover:underline mb-4 inline-block">
        ← Voltar às máquinas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Coluna principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Imagem */}
          <div className="card overflow-hidden">
            <div className="h-72 bg-gray-100 relative">
              {maquina.img_url ? (
                <img src={maquina.img_url} alt={maquina.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🏗️</div>
              )}
              <span className={`absolute top-3 right-3 text-sm font-semibold px-3 py-1 rounded-full ${
                maquina.disponibilidade ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {maquina.disponibilidade ? '✅ Disponível' : '❌ Indisponível'}
              </span>
            </div>
          </div>

          {/* Informações */}
          <div className="card p-6">
            <p className="text-sm text-yellow-600 font-semibold uppercase tracking-wide mb-1">
              {maquina.tipo_maquina}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{maquina.nome}</h1>
            <p className="text-gray-500 text-sm mb-4">
              📍 {maquina.localizacao || maquina.proprietario?.cidade || 'Localização não informada'}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  R$ {Number(maquina.preco_diaria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-400 ml-1">/dia</span>
              </div>
              <div className="text-sm text-gray-400">⭐ {Number(maquina.avaliacao).toFixed(1)}</div>
            </div>

            {maquina.descricao && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                <p className="text-gray-600 leading-relaxed">{maquina.descricao}</p>
              </div>
            )}
          </div>

          {/* Especificações */}
          {(maquina.especificacoes || maquina.recursos) && (
            <div className="card p-6">
              {maquina.especificacoes && Object.keys(maquina.especificacoes).length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Especificações Técnicas</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    {Object.entries(maquina.especificacoes).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg px-3 py-2">
                        <dt className="text-xs text-gray-400 capitalize">{k}</dt>
                        <dd className="font-medium text-gray-800 text-sm">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              {Array.isArray(maquina.recursos) && maquina.recursos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Recursos</h3>
                  <ul className="flex flex-wrap gap-2">
                    {maquina.recursos.map((r, i) => (
                      <li key={i} className="bg-yellow-50 text-yellow-700 text-sm px-3 py-1 rounded-full border border-yellow-200">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Proprietário */}
          {maquina.proprietario && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Proprietário</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xl">
                  {maquina.proprietario.nome?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{maquina.proprietario.nome}</p>
                  <p className="text-sm text-gray-400">
                    {maquina.proprietario.cidade}{maquina.proprietario.estado ? ` — ${maquina.proprietario.estado}` : ''}
                  </p>
                </div>
              </div>
              {maquina.proprietario.telefone && (
                <a
                  href={`tel:${maquina.proprietario.telefone}`}
                  className="btn-primary w-full text-center block mb-2"
                >
                  📞 {maquina.proprietario.telefone}
                </a>
              )}
              {maquina.proprietario.email && (
                <a
                  href={`mailto:${maquina.proprietario.email}`}
                  className="btn-secondary w-full text-center block"
                >
                  ✉️ Enviar e-mail
                </a>
              )}
            </div>
          )}

          {/* Ações do proprietário */}
          {eProprietario && (
            <div className="card p-6 border-yellow-200 bg-yellow-50">
              <p className="text-sm font-semibold text-yellow-700 mb-3">Esta é sua máquina</p>
              <Link href={`/maquinas/${id}/editar`} className="btn-primary w-full text-center block mb-2">
                Editar anúncio
              </Link>
              <button
                onClick={deletar}
                disabled={deletando}
                className="w-full text-sm bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 px-4 rounded-lg border border-red-200 transition disabled:opacity-50"
              >
                {deletando ? 'Removendo...' : 'Remover anúncio'}
              </button>
            </div>
          )}

          {/* Detalhes rápidos */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Detalhes</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">Tipo</dt>
                <dd className="font-medium text-gray-700">{maquina.tipo_maquina}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Preço/dia</dt>
                <dd className="font-medium text-gray-700">
                  R$ {Number(maquina.preco_diaria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Status</dt>
                <dd className={`font-medium ${maquina.disponibilidade ? 'text-green-600' : 'text-red-600'}`}>
                  {maquina.disponibilidade ? 'Disponível' : 'Indisponível'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
