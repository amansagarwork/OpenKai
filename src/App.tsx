import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import HomePage from './components/pages/HomePage';
import PasteView from './components/pages/PasteView';
import ToolsLanding from './components/pages/ToolsLanding';
import OpenPasteHub from './components/pages/OpenPasteHub';
import ReceivePost from './components/pages/ReceivePost';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import PasteHistory from './components/pages/PasteHistory';
import MinusURL from './components/pages/MinusURL';
import RedirectPage from './components/pages/RedirectPage';
import Profile from './components/pages/Profile';
import Terminal from './components/pages/Terminal';
import TerminalSessions from './components/pages/TerminalSessions';
import CodeHealth from './components/pages/CodeHealth';
import AuthModal from './components/core/AuthModal';
import { getToken } from './lib/auth';

const MAX_WIDTH = 'max-w-[900px]';

function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`${MAX_WIDTH} mx-auto w-full px-4 ${className}`}>
      {children}
    </div>
  );
}

function BackButton({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
    </div>
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
    | { view: 'profile' }
    | { view: 'paste'; pasteId: string }
    | { view: 'minusurl' }
    | { view: 'terminal'; sessionId?: string }
    | { view: 'terminal_sessions' }
    | { view: 'codehealth' }
    | { view: 'redirect'; shortId: string }
  >({
    view: 'landing',
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [authFeature, setAuthFeature] = useState<string>('this feature');
  const isLoggedIn = !!getToken();

  const parseRoute = (pathname: string) => {
    if (pathname === '/' || pathname === '') {
      return { view: 'landing' as const };
    }

    if (pathname === '/open-kai') {
      return { view: 'openpaste_hub' as const };
    }

    if (pathname === '/open-kai/send') {
      return { view: 'openpaste_send' as const };
    }

    if (pathname === '/open-kai/history') {
      return { view: 'history' as const };
    }

    if (pathname === '/receive-post' || pathname === '/recive-post') {
      return { view: 'receive_post' as const };
    }

    if (pathname === '/login') {
      return { view: 'login' as const };
    }

    if (pathname === '/profile') {
      return { view: 'profile' as const };
    }

    if (pathname === '/register') {
      return { view: 'register' as const };
    }

    if (pathname === '/minusurl' || pathname === '/minus-url') {
      return { view: 'minusurl' as const };
    }

    if (pathname === '/terminal') {
      return { view: 'terminal_sessions' as const };
    }

    if (pathname === '/code-health' || pathname === '/codehealth') {
      return { view: 'codehealth' as const };
    }

    const terminalMatch = pathname.match(/^\/terminal\/([a-zA-Z0-9_-]+)$/);
    if (terminalMatch) {
      return { view: 'terminal' as const, sessionId: terminalMatch[1] };
    }

    const openPasteMatch = pathname.match(/^\/open-kai\/(text|image|file)\/([a-z]{3}[0-9]{3})$/);
    if (openPasteMatch) {
      return { view: 'paste' as const, pasteId: openPasteMatch[2] };
    }

    // Legacy support for old format without prefix
    const legacyOpenPasteMatch = pathname.match(/^\/open-kai\/([a-z]{3}[0-9]{3})$/);
    if (legacyOpenPasteMatch) {
      return { view: 'paste' as const, pasteId: legacyOpenPasteMatch[1] };
    }

    // Handle short URL redirect preview page /u/[shortId]
    const shortUrlMatch = pathname.match(/^\/u\/([a-z0-9]{6})$/);
    if (shortUrlMatch) {
      return { view: 'redirect' as const, shortId: shortUrlMatch[1] };
    }

    const legacyMatch = pathname.match(/^\/([a-z]{3}[0-9]{3})$/);
    if (legacyMatch) {
      const id = legacyMatch[1];
      // Default to text for legacy URLs without type info
      window.history.replaceState({}, '', `/open-kai/text/${id}`);
      return { view: 'paste' as const, pasteId: id };
    }

    return { view: 'landing' as const };
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(parseRoute(path));
  };

  // Navigate with auth check - shows modal for protected features
  const navigateWithAuth = (path: string, feature: string = 'this feature') => {
    if (isLoggedIn) {
      navigate(path);
      return;
    }

    // Check if user has previously chosen "Continue as Guest"
    const savedChoice = localStorage.getItem('authChoice');
    if (savedChoice === 'guest') {
      navigate(path);
      return;
    }

    // Show modal if no saved choice or user chose login
    setPendingNavigation(path);
    setAuthFeature(feature);
    setAuthModalOpen(true);
  };

  const handleGuestContinue = () => {
    // Save user's choice to localStorage
    localStorage.setItem('authChoice', 'guest');
    setAuthModalOpen(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleLogin = () => {
    // Clear saved choice when user chooses to login
    localStorage.removeItem('authChoice');
    setAuthModalOpen(false);
    navigate('/login');
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
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <PasteView pasteId={route.pasteId} onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'receive_post') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <ReceivePost onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <Login onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <Register onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <PasteHistory onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <Profile onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'openpaste_send') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <HomePage
            onPasteCreated={(newPasteId) => navigate(`/open-kai/${newPasteId}`)}
          />
        </Container>
      </div>
    );
  }

  if (route.view === 'openpaste_hub') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <OpenPasteHub onNavigate={navigate} />
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onGuest={handleGuestContinue}
            onLogin={handleLogin}
            feature={authFeature}
          />
        </Container>
      </div>
    );
  }

  if (route.view === 'minusurl') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <MinusURL onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'terminal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <Terminal sessionId={route.sessionId} onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'terminal_sessions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <TerminalSessions onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'codehealth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Container>
          <Navbar onNavigate={navigate} />
          <BackButton onNavigate={navigate} />
          <CodeHealth onNavigate={navigate} />
        </Container>
      </div>
    );
  }

  if (route.view === 'redirect' && route.shortId) {
    return <RedirectPage shortId={route.shortId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Container>
        <Navbar onNavigate={navigate} />
        <ToolsLanding 
          onNavigate={navigate} 
          onAuthNavigate={navigateWithAuth}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onGuest={handleGuestContinue}
          onLogin={handleLogin}
          feature={authFeature}
        />
      </Container>
    </div>
  );
}

export default App;
