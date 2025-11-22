import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider'; 
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminStats } from './pages/AdminStats'; 
import { AdminSchedule } from './pages/AdminSchedule';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Privadas (Protegidas) */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Rotas de Cliente (Exemplo) */}
          <Route path="/dogs" element={<PrivateRoute><div>Gerenciamento de Cães...</div></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><div>Histórico de Agendamentos...</div></PrivateRoute>} />
          <Route path="/appointments/new" element={<PrivateRoute><div>Novo Agendamento...</div></PrivateRoute>} />

          {/* Rotas de Admin (Exclusivas) */}
          <Route path="/admin/stats" element={<PrivateRoute><AdminStats /></PrivateRoute>} />
          <Route path="/admin/schedule" element={<PrivateRoute><AdminSchedule /></PrivateRoute>} />
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;