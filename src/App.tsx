import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // <-- Import file baru tadi
import BookingHistoryPage from './pages/BookingHistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Login (Awal) */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Halaman Dashboard (Setelah Login) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<BookingHistoryPage />} />
      </Routes>
    </Router>
  )
}

export default App;