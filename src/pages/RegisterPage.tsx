import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Swal from 'sweetalert2';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: ''
    });
    const [loading, setLoading] = useState(false);

    // Sinkronisasi body style agar konsisten dengan tema Midnight Elite
    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.background = "#020617";
        document.body.style.minHeight = "100vh";
        document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        document.body.style.color = "#f8fafc";
        document.body.style.overflow = "hidden";
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/Auth/register', formData);
            
            await Swal.fire({
                icon: 'success',
                title: 'Registrasi Berhasil!',
                text: 'Akun Anda telah terdaftar. Silakan masuk untuk melanjutkan.',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#6366f1',
                timer: 3000
            });

            navigate('/'); 
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Pendaftaran Gagal',
                text: error.response?.data || "Terjadi kesalahan sistem saat mendaftar.",
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            {/* Efek Ambient Aurora Glow */}
            <div style={styles.glowTopRight}></div>
            <div style={styles.glowBottomLeft}></div>

            <div style={styles.glassCard}>
                <div style={styles.header}>
                    <div style={styles.iconBox}>🌌</div>
                    <h1 style={styles.mainTitle}>Daftar <span style={styles.accentText}>Akun</span></h1>
                    <p style={styles.mainSubtitle}>Daftar akun baru untuk mahasiswa.</p>
                </div>

                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nama Lengkap</label>
                        <input 
                            placeholder="Masukkan nama lengkap Anda"
                            required
                            style={styles.input}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nama Pengguna</label>
                        <input 
                            placeholder="Masukkan Username"
                            required
                            style={styles.input}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Kata Sandi</label>
                        <input 
                            type="password"
                            placeholder="••••••••"
                            required
                            style={styles.input}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={{ margin: 0, color: '#cbd5e1' }}>Sudah memiliki akun?</p>
                    <span style={styles.loginLink} onClick={() => navigate('/')}>
                        Masuk di sini
                    </span>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#020617',
        position: 'relative',
        overflow: 'hidden'
    },
    // Aurora Glow Effects
    glowTopRight: { position: 'absolute', top: '-150px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', zIndex: 0 },
    glowBottomLeft: { position: 'absolute', bottom: '-200px', left: '-150px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)', zIndex: 0 },
    
    glassCard: { 
        padding: '50px 40px', 
        backgroundColor: 'rgba(15, 23, 42, 0.5)', 
        backdropFilter: 'blur(15px)',
        borderRadius: '28px', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
        width: '100%',
        maxWidth: '420px',
        zIndex: 10,
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
        padding: '14px 18px', 
        borderRadius: '14px', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        backgroundColor: 'rgba(2, 6, 23, 0.3)', 
        color: '#fff',
        outline: 'none',
        fontSize: '14px',
        boxSizing: 'border-box',
        transition: '0.3s'
    },
    submitBtn: { 
        padding: '16px', 
        background: 'linear-gradient(to right, #6366f1, #22d3ee)', 
        color: 'white', 
        border: 'none', 
        borderRadius: '14px', 
        cursor: 'pointer', 
        fontWeight: '900',
        marginTop: '10px',
        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
        letterSpacing: '1px',
        transition: '0.3s'
    },
    footer: { marginTop: '25px', fontSize: '13px' },
    loginLink: { 
        color: '#38bdf8', 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        display: 'inline-block', 
        marginTop: '5px', 
        textDecoration: 'underline' 
    }
};

export default RegisterPage;