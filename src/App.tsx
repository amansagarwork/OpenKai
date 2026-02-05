import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import PasteView from './components/PasteView';
import ToolsLanding from './components/ToolsLanding';
import OpenPasteHub from './components/OpenPasteHub';
import ReceivePost from './components/ReceivePost';
import Login from './components/Login';
import Register from './components/Register';
import PasteHistory from './components/PasteHistory';
import MinusURL from './components/MinusURL';
import RedirectPage from './components/RedirectPage';

function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="flex items-center gap-2 px-4 py-2 mt-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="font-medium">Back</span>
    </button>
  );
}

function App() {
  const [route, setRoute] = useState<
    | { view: 'landing' }
    | { view: 'openpaste_hub' }
    | { view: 'openpaste_send' }
    | { view: 'receive_post' }
    | { view: 'login' }
    | { view: 'register' }
    | { view: 'history' }
    | { view: 'paste'; pasteId: string }
    | { view: 'minusurl' }
    | { view: 'redirect'; shortId: string }
  >({
    view: 'landing',
  });

  const parseRoute = (pathname: string) => {
    if (pathname === '/' || pathname === '') {
      return { view: 'landing' as const };
    }

    if (pathname === '/open-paste') {
      return { view: 'openpaste_hub' as const };
    }

    if (pathname === '/open-paste/send') {
      return { view: 'openpaste_send' as const };
    }

    if (pathname === '/open-paste/history') {
      return { view: 'history' as const };
    }

    if (pathname === '/receive-post' || pathname === '/recive-post') {
      return { view: 'receive_post' as const };
    }

    if (pathname === '/login') {
      return { view: 'login' as const };
    }

    if (pathname === '/register') {
      return { view: 'register' as const };
    }

    if (pathname === '/minusurl' || pathname === '/minus-url') {
      return { view: 'minusurl' as const };
    }

    const openPasteMatch = pathname.match(/^\/open-paste\/([a-z]{3}[0-9]{3})$/);
    if (openPasteMatch) {
      return { view: 'paste' as const, pasteId: openPasteMatch[1] };
    }

    // Handle short URL redirect preview page /u/[shortId]
    const shortUrlMatch = pathname.match(/^\/u\/([a-z0-9]{6})$/);
    if (shortUrlMatch) {
      return { view: 'redirect' as const, shortId: shortUrlMatch[1] };
    }

    const legacyMatch = pathname.match(/^\/([a-z]{3}[0-9]{3})$/);
    if (legacyMatch) {
      const id = legacyMatch[1];
      window.history.replaceState({}, '', `/open-paste/${id}`);
      return { view: 'paste' as const, pasteId: id };
    }

    return { view: 'landing' as const };
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(parseRoute(path));
  };

  useEffect(() => {
    setRoute(parseRoute(window.location.pathname));

    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (route.view === 'paste' && route.pasteId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onNavigate={navigate} />
        <div className="max-w-[900px] mx-auto w-full px-4">
          <BackButton />
          <PasteView pasteId={route.pasteId} onNavigate={navigate} />
        </div>
      </div>
    );
  }

  if (route.view === 'receive_post') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onNavigate={navigate} />
        <div className="max-w-[900px] mx-auto w-full px-4">
          <BackButton />
          <ReceivePost onNavigate={navigate} />
        </div>
      </div>
    );
  }

  if (route.view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onNavigate={navigate} />
        <div className="max-w-[900px] mx-auto w-full px-4">
          <BackButton />
          <Login onNavigate={navigate} />
        </div>
      </div>
    );
  }

  if (route.view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onNavigate={navigate} />
        <div className="max-w-[900px] mx-auto w-full px-4">
          <BackButton />
          <Register onNavigate={navigate} />
        </div>
      </div>
    );
  }

  if (route.view === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onNavigate={navigate} />
        <div className="max-w-[900px] mx-auto w-full px-4">
          <BackButton />
          <PasteHistory onNavigate={navigate} />
        </div>
      </div>
    );
  }

  if (route.view === 'openpaste_send') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onNavigate={navigate} />
        <div className="max-w-[900px] mx-auto w-full px-4">
          <BackButton />
          <HomePage
            onNavigate={navigate}
            onPasteCreated={(newPasteId) => navigate(`/open-paste/${newPasteId}`)}
          />
        </div>
      </div>
    );
  }

  if (route.view === 'openpaste_hub') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onNavigate={navigate} />
        <div className="max-w-[900px] mx-auto w-full px-4">
          <BackButton />
          <OpenPasteHub onNavigate={navigate} />
        </div>
      </div>
    );
  }

  if (route.view === 'minusurl') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onNavigate={navigate} />
        <div className="max-w-[900px] mx-auto w-full px-4">
          <BackButton />
          <MinusURL onNavigate={navigate} />
        </div>
      </div>
    );
  }

  if (route.view === 'redirect' && route.shortId) {
    return <RedirectPage shortId={route.shortId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onNavigate={navigate} />
      <div className="max-w-[900px] mx-auto w-full">
        <ToolsLanding onNavigate={navigate} />
      </div>
    </div>
  );
}

export default App;
