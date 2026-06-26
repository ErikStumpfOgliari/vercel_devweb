import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'SoloObra — Marketplace de Máquinas Pesadas',
  description: 'Encontre e alugue máquinas pesadas na sua região com segurança e praticidade.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm mt-8">
          © {new Date().getFullYear()} SoloObra — Marketplace de Máquinas Pesadas
        </footer>
      </body>
    </html>
  );
}
