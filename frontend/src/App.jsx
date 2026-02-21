import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Facilities from './pages/Facilities';
import Admissions from './pages/Admissions';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import DashboardHome from './pages/admin/DashboardHome';
import CollegeInfoAdmin from './pages/admin/CollegeInfo';
import AgentControl from './pages/admin/AgentControl';
import Knowledge from './pages/admin/Knowledge';
import CallHistory from './pages/admin/CallHistory';
import LiveMonitor from './pages/admin/LiveMonitor';
import Automation from './pages/admin/Automation';
import Settings from './pages/admin/Settings';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VoiceCallModal from './components/VoiceCallModal';
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper to conditionally show Navbar & Footer only on public pages
const PublicLayout = ({ children, onTalkToAI }) => {
    const location = useLocation();
    const isAuthPage = location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/dashboard';
    const isMinimalLanding = location.pathname === '/';
    if (isAuthPage || isMinimalLanding) return children;
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onTalkToAI={onTalkToAI} />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
};

function App() {
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

    return (
        <Router>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: { borderRadius: '16px', fontWeight: '600' }
                }}
            />
            <VoiceCallModal
                isOpen={isVoiceModalOpen}
                onClose={() => setIsVoiceModalOpen(false)}
            />
            <PublicLayout onTalkToAI={() => setIsVoiceModalOpen(true)}>
                <Routes>
                    {/* ── Public Routes ───────────────────────── */}
                    <Route path="/" element={<Landing onTalkToAI={() => setIsVoiceModalOpen(true)} />} />
                    <Route path="/home" element={<Home onTalkToAI={() => setIsVoiceModalOpen(true)} />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/facilities" element={<Facilities />} />
                    <Route path="/admissions" element={<Admissions />} />

                    {/* ── Auth Routes ─────────────────────────── */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute requireAdmin={false}>
                            <Dashboard onTalkToAI={() => setIsVoiceModalOpen(true)} />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardHome />} />
                        <Route path="college-info" element={<CollegeInfoAdmin />} />
                        <Route path="agent" element={<AgentControl />} />
                        <Route path="knowledge" element={<Knowledge />} />
                        <Route path="live-monitor" element={<LiveMonitor />} />
                        <Route path="calls" element={<CallHistory />} />
                        <Route path="automation" element={<Automation />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* ── 404 ─────────────────────────────────── */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </PublicLayout>
        </Router>
    );
}

export default App;
