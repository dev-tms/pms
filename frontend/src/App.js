import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Navigation from './navigation';
import './styles';
import Header from './components/Header/Header.js';
import Sidebar from './components/Sidebar/Sidebar.js';

const MOBILE_BREAKPOINT = 2000;

const App = ({ authenticated, profile }) => {
  // console.log("authentiocation",authenticated)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobileView = window.innerWidth < MOBILE_BREAKPOINT;

      setIsMobileView(nextIsMobileView);

      if (!nextIsMobileView) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);





  return (
    <>
      <div className='flex min-h-screen'>
        {
          authenticated && (
            <>
              {!isMobileView && (
                <aside
                  className='w-full max-w-[250px] shrink-0'
                  style={{ backgroundColor: 'var(--app-sidebar-bg)' }}
                >
                  <Sidebar profile authenticated />
                </aside>
              )}

              {isMobileView && (
                <>
                  <div
                    className={`fixed inset-0 z-40 bg-slate-950/55 transition-opacity duration-300 ${isMobileSidebarOpen
                      ? 'pointer-events-auto opacity-100'
                      : 'pointer-events-none opacity-0'
                      }`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-hidden='true'
                  />
                  <aside
                    id='mobile-sidebar'
                    className={`fixed inset-y-0 left-0 z-50 w-[250px] max-w-[85vw] transform transition-transform duration-300 ease-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                      }`}
                    style={{ backgroundColor: 'var(--app-sidebar-bg)' }}
                    aria-hidden={!isMobileSidebarOpen}
                  >
                    <Sidebar profile authenticated />

                  </aside>
                </>
              )}
            </>
          )
        }


        <main
          className='w-full overflow-hidden'
          style={{
            backgroundColor: 'var(--app-bg)',
            color: 'var(--app-text)',
          }}
        >
          <Header
            isMobileView={isMobileView}
            isMobileSidebarOpen={isMobileSidebarOpen}
            onMenuToggle={() =>
              setIsMobileSidebarOpen((prev) => !prev)
            }
            profile
            authenticated
          />
          <Navigation />
          {/* <Footer /> */}
        </main>
      </div>
    </>
  );
};

const mapStateToProps = ({ session }) => {
  return {
    profile: session?.user?.user,
    authenticated: session.authenticated
  };
};

export default connect(mapStateToProps)(App);
