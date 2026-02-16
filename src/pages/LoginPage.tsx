import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { LoginResponse } from '../types/auth'; // Pakai 'type' biar aman

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post<LoginResponse>('/Auth/login', {
        username,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', username);
      navigate('/dashboard'); 
      
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('Username atau Password salah!');
      } else {
        setError('Gagal terhubung ke server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background decoration (Opsional: Lingkaran hiasan) */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>

      {/* KARTU LOGIN UTAMA */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back! 👋</h1>
          <p style={styles.subtitle}>Sistem Peminjaman Ruangan Kampus</p>
        </div>
        
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Contoh: mahasiswa"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Sedang Masuk...' : 'LOGIN SEKARANG'}
          </button>
        </form>

        <p style={styles.footerText}>
          Belum punya akun? Hubungi <span style={{color: '#007bff', cursor: 'pointer'}}>Admin Kampus</span>.
        </p>
      </div>
    </div>
  );
};

// CSS-in-JS (Style Object)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Gradasi abu-abu ke biru muda
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: 'white',
    padding: '40px 50px', // Padding lebih besar biar lega
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', // Bayangan lembut tapi tegas
    width: '100%',
    maxWidth: '480px', // Lebar maksimal desktop standard
    zIndex: 2,
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#718096',
    margin: 0,
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
  },
  input: {
    width: '100%',
    padding: '14px 16px', // Input lebih tinggi
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '16px',
    color: '#2d3748',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#3182ce', // Biru profesional
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 6px rgba(49, 130, 206, 0.3)',
    transition: 'background-color 0.2s',
  },
  errorAlert: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #fed7d7',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px',
    color: '#718096',
  },
  // Hiasan background (Lingkaran abstrak)
  circle1: {
    position: 'absolute',
    top: '-50px',
    left: '-50px',
    width: '300px',
    height: '300px',
    backgroundColor: 'rgba(49, 130, 206, 0.1)',
    borderRadius: '50%',
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    bottom: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
    borderRadius: '50%',
    zIndex: 1,
  }
};

export default LoginPage;