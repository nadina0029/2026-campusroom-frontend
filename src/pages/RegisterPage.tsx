import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: ''
    });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/Auth/register', formData);
            // GANTI PESAN INI:
            alert("✅ Registrasi Berhasil! Silakan Login."); 
            navigate('/'); 
        } catch (error: any) {
            alert("Gagal daftar: " + (error.response?.data || error.message));
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Daftar Akun Baru</h2>
                <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <input 
                        placeholder="Nama Lengkap (Full Name)"
                        required
                        style={styles.input}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                    <input 
                        placeholder="Username"
                        required
                        style={styles.input}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                    <input 
                        type="password"
                        placeholder="Password"
                        required
                        style={styles.input}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="submit" style={styles.btn}>Daftar Sekarang</button>
                </form>
                <p style={{textAlign: 'center', marginTop: '15px', fontSize: '14px'}}>
                    Sudah punya akun? <span style={{color: 'blue', cursor: 'pointer'}} onClick={() => navigate('/')}>Login di sini</span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fe' },
    card: { padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
    btn: { padding: '12px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default RegisterPage;