import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import type { Room } from '../types/auth';
import Swal from 'sweetalert2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomToEdit: Room | null;
}

const RoomModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, roomToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    facilities: '',
    isAvailable: true
  });

  useEffect(() => {
    if (roomToEdit) {
      setFormData({
        name: roomToEdit.name,
        capacity: roomToEdit.capacity,
        facilities: roomToEdit.facilities,
        isAvailable: roomToEdit.isAvailable
      });
    } else {
      setFormData({ name: '', capacity: 0, facilities: '', isAvailable: true });
    }
  }, [roomToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (roomToEdit) {
        await api.put(`/Rooms/${roomToEdit.id}`, { ...formData, id: roomToEdit.id });
      } else {
        await api.post('/Rooms', formData);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Data ruangan telah berhasil ${roomToEdit ? 'diperbarui' : 'ditambahkan'}.`,
        background: '#0f172a', 
        color: '#fff', 
        confirmButtonColor: '#6366f1',
        timer: 1500, 
        showConfirmButton: false
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Gagal', 
        text: 'Terjadi kesalahan saat memproses data.', 
        background: '#0f172a', 
        color: '#fff' 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.glassModal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              {roomToEdit ? '✏️ Ubah' : '➕ Tambah'} <span style={styles.accentText}>Ruangan</span>
            </h2>
            <p style={styles.subtitle}>
              {roomToEdit ? 'Edit ruangan kampus' : 'Tambahkan ruangan kampus yang baru.'}
              </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Ruangan</label>
            <input 
              style={styles.input} 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Contoh: Lab Jaringan 1"
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Kapasitas Maksimal (Orang)</label>
            <input 
              type="number" 
              style={styles.input} 
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
              placeholder="0"
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Fasilitas</label>
            <textarea 
              style={{...styles.input, minHeight: '120px', resize: 'none'}} 
              value={formData.facilities}
              onChange={e => setFormData({...formData, facilities: e.target.value})}
              placeholder="Contoh: High-speed Wi-Fi, Proyektor 4K, AC, 30 unit PC i9..."
              required 
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            {roomToEdit ? 'SIMPAN PERUBAHAN' : 'SIMPAN RUANGAN'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: { 
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
    backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
  },
  glassModal: { 
    backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(25px)', 
    width: '90%', maxWidth: '480px', borderRadius: '30px', padding: '40px', 
    border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' 
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px' },
  title: { color: '#fff', margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '-1px' },
  accentText: { background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#cbd5e1', fontSize: '13px', margin: '8px 0 0 0', fontWeight: '500' },
  closeBtn: { background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '22px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#38bdf8', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' },
  input: { 
    padding: '14px 18px', backgroundColor: 'rgba(2, 6, 23, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '14px', color: '#fff', outline: 'none', fontSize: '14px', transition: '0.3s', fontFamily: 'inherit'
  },
  submitBtn: { 
    padding: '16px', background: 'linear-gradient(to right, #6366f1, #22d3ee)', 
    color: '#fff', border: 'none', borderRadius: '14px', fontSize: '13px', fontWeight: '900', 
    cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
    letterSpacing: '1px', marginTop: '10px'
  }
};

export default RoomModal;