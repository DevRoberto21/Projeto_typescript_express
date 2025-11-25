import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider'; 
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminStats } from './pages/AdminStats'; 
import { AdminSchedule } from './pages/AdminSchedule';
// Importação do componente AdminServices
import { AdminServices } from './pages/AdminServices'; 
import { DogManagement } from './pages/DogManagement'; 
import { AppointmentHistory } from './pages/AppointmentHistory';
import { NewAppointment } from './pages/NewAppointments';


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
          
          {/* Rotas de Cliente (Funcionais) */}
          <Route path="/dogs" element={<PrivateRoute><DogManagement /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><AppointmentHistory /></PrivateRoute>} />
          <Route path="/appointments/new" element={<PrivateRoute><NewAppointment /></PrivateRoute>} />

          {/* Rotas de Admin (Exclusivas) */}
          <Route path="/admin/stats" element={<PrivateRoute><AdminStats /></PrivateRoute>} />
          <Route path="/admin/schedule" element={<PrivateRoute><AdminSchedule /></PrivateRoute>} />
          {/* ROTA FALTANTE ADICIONADA: Gerenciar Serviços */}
          <Route path="/admin/services" element={<PrivateRoute><AdminServices /></PrivateRoute>} />
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;