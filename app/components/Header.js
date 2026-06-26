'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('usuario');
    if (u) {
      try { setUsuario(JSON.parse(u)); } catch { /* ignore */ }
    }
  }, [pathname]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    router.push('/');
  }

  return (
    <header className="bg-yellow-500 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight">
          🏗️ SoloObra
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/" className="text-white hover:text-yellow-100 font-medium transition">
            Máquinas
          </Link>
          {usuario && (
            <Link href="/dashboard" className="text-white hover:text-yellow-100 font-medium transition">
              Dashboard
            </Link>
          )}
          {usuario ? (
            <div className="flex items-center gap-3">
              <span className="text-yellow-100 text-sm">
                Olá, <strong>{usuario.nome?.split(' ')[0]}</strong>
              </span>
              <button
                onClick={logout}
                className="bg-white text-yellow-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-yellow-50 transition text-sm"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-white hover:text-yellow-100 font-medium transition"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="bg-white text-yellow-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-yellow-50 transition text-sm"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden text-white"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuAberto ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuAberto && (
        <div className="sm:hidden bg-yellow-600 px-4 pb-4 flex flex-col gap-3">
          <Link href="/" className="text-white font-medium" onClick={() => setMenuAberto(false)}>
            Máquinas
          </Link>
          {usuario && (
            <Link href="/dashboard" className="text-white font-medium" onClick={() => setMenuAberto(false)}>
              Dashboard
            </Link>
          )}
          {usuario ? (
            <button onClick={logout} className="text-left text-yellow-100 font-medium">
              Sair ({usuario.nome?.split(' ')[0]})
            </button>
          ) : (
            <>
              <Link href="/login" className="text-white font-medium" onClick={() => setMenuAberto(false)}>
                Entrar
              </Link>
              <Link href="/cadastro" className="text-white font-medium" onClick={() => setMenuAberto(false)}>
                Cadastrar
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
