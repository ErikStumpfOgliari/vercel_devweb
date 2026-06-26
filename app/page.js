'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const TIPOS = [
  'Todos', 'Escavadeira', 'Retroescavadeira', 'Trator', 'Betoneira',
  'Guindaste', 'Compactador', 'Caminhão Basculante', 'Plataforma Elevatória', 'Motoniveladora',
];

export default function Home() {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [localFiltro, setLocalFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  const carregarMaquinas = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (busca) p.set('q', busca);
      if (tipoFiltro) p.set('tipo', tipoFiltro);
      if (localFiltro) p.set('local', localFiltro);
      const res = await fetch(`/api/maquinas?${p}`);
      const data = await res.json();
      setMaquinas(Array.isArray(data) ? data : []);
    } catch {
      setMaquinas([]);
    } finally {
      setLoading(false);
    }
  }, [busca, tipoFiltro, localFiltro]);

  useEffect(() => {
    const timer = setTimeout(carregarMaquinas, 300);
    return () => clearTimeout(timer);
  }, [carregarMaquinas]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Alugue Máquinas Pesadas
          </h1>
          <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
            Escavadeiras, tratores, betoneiras e muito mais — conectando quem precisa a quem tem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="🔍  Buscar por nome da máquina..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 shadow focus:outline-none focus:ring-2 focus:ring-white"
            />
            <input
              type="text"
              placeholder="📍  Localização..."
              value={localFiltro}
              onChange={(e) => setLocalFiltro(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 shadow focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </section>

      {/* Filtros por tipo */}
      <div className="bg-white border-b shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {TIPOS.map((tipo) => {
            const ativo = tipo === 'Todos' ? !tipoFiltro : tipoFiltro === tipo;
            return (
              <button
                key={tipo}
                onClick={() => setTipoFiltro(tipo === 'Todos' ? '' : tipo)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  ativo
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tipo}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de máquinas */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Carregando máquinas...</p>
            </div>
          </div>
        ) : maquinas.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🚜</p>
            <p className="text-xl font-medium mb-2">Nenhuma máquina encontrada</p>
            <p className="text-sm">Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {maquinas.length} máquina{maquinas.length !== 1 ? 's' : ''} encontrada{maquinas.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {maquinas.map((m) => (
                <MaquinaCard key={m.id} maquina={m} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MaquinaCard({ maquina }) {
  return (
    <Link href={`/maquinas/${maquina.id}`} className="block group">
      <div className="card overflow-hidden hover:shadow-md transition-shadow">
        <div className="h-44 bg-gray-100 relative overflow-hidden">
          {maquina.img_url ? (
            <img
              src={maquina.img_url}
              alt={maquina.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
              <span className="text-xs mt-1">Sem imagem</span>
            </div>
          )}
          <span
            className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
              maquina.disponibilidade
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {maquina.disponibilidade ? 'Disponível' : 'Indisponível'}
          </span>
        </div>
        <div className="p-4">
          <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide mb-1">
            {maquina.tipo_maquina}
          </p>
          <h3 className="font-bold text-gray-900 truncate mb-1">{maquina.nome}</h3>
          <p className="text-xs text-gray-400 mb-3 truncate">
            📍 {maquina.localizacao || maquina.proprietario?.cidade || 'Localização não informada'}
          </p>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xl font-bold text-gray-900">
                R$ {Number(maquina.preco_diaria).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-400 ml-1">/dia</span>
            </div>
            <span className="text-xs text-gray-400">
              ⭐ {Number(maquina.avaliacao).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
