import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { LoginResponse } from '../types/auth'; 
import Swal from 'sweetalert2';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mengatur body agar penuh dan menggunakan background Midnight gelap
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#020617";
    document.body.style.minHeight = "100vh";
    document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
    document.body.style.color = "#f8fafc";
    document.body.style.overflow = "hidden";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/Auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', username);
      
      Swal.fire({
        icon: 'success',
        title: 'Akses Diterima',
        text: 'Selamat datang kembali di sistem!',
        timer: 1500,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#fff'
      });

      navigate('/dashboard'); 
      
    } catch (err: any) {
      let errorMsg = 'Gagal terhubung ke server.';
      if (err.response) {
         errorMsg = err.response.status === 401 ? 'Username atau Kata Sandi salah!' : err.response.data;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: errorMsg,
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Efek Cahaya Aurora di Latar Belakang */}
      <div style={styles.glowTopRight}></div>
      <div style={styles.glowBottomLeft}></div>

      <div style={styles.glassCard}>
        <div style={styles.header}>
          <div style={styles.iconBox}>✨</div>
          <h1 style={styles.mainTitle}>Selamat <span style={styles.accentText}>Datang</span></h1>
          <p style={styles.mainSubtitle}>Login ke sistem peminjaman ruangan kampus.</p>
        </div>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Pengguna</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Masukkan username Anda"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'MENYINKRONKAN...' : 'MASUK SEKARANG'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ margin: 0, color: '#cbd5e1' }}>Belum memiliki akun?</p>
          <span style={styles.registerLink} onClick={() => navigate('/register')}>
            Daftar akun baru di sini
          </span>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', width: '100vw', background: '#020617',
    position: 'relative', overflow: 'hidden'
  },
  // Efek Ambient Aurora yang sama dengan Dashboard
  glowTopRight: { position: 'absolute', top: '-150px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', zIndex: 0 },
  glowBottomLeft: { position: 'absolute', bottom: '-200px', left: '-150px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)', zIndex: 0 },
  
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(15px)',
    padding: '50px 40px', borderRadius: '28px', border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', width: '100%', maxWidth: '420px', zIndex: 10,
    textAlign: 'center'
  },
  header: { marginBottom: '35px' },
  iconBox: { fontSize: '30px', marginBottom: '15px' },
  mainTitle: { fontSize: '32px', color: '#fff', margin: 0, fontWeight: '900', letterSpacing: '-1px' },
  accentText: { background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  mainSubtitle: { color: '#cbd5e1', marginTop: '10px', fontSize: '14px', fontWeight: '500' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
  label: { fontSize: '11px', color: '#38bdf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' },
  input: {
    width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(2, 6, 23, 0.3)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: '0.3s'
  },
  submitBtn: {
    width: '100%', padding: '16px', background: 'linear-gradient(to right, #6366f1, #22d3ee)',
    color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '900',
    cursor: 'pointer', transition: '0.3s', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
    marginTop: '10px', letterSpacing: '1px'
  },
  footer: { marginTop: '25px', fontSize: '13px' },
  registerLink: { 
    color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold', 
    display: 'inline-block', marginTop: '5px', textDecoration: 'underline' 
  }
};

export default LoginPage;