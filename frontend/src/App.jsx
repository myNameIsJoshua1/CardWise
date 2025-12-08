import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './components/AppContent';
import { UserProvider } from './contexts/UserContext';
import PerformanceMonitor from './components/PerformanceMonitor';
import './styles/App.css';
import { ToastProvider } from './hooks/use-toast';

function App() {
    return (
        <Router>
            <UserProvider>
                    <ToastProvider>
                        <PerformanceMonitor>
                            <div className="min-h-screen transition-colors duration-200">
                                <AppContent />
                            </div>
                        </PerformanceMonitor>
                    </ToastProvider>
            </UserProvider>
        </Router>
    );
}

export default App;