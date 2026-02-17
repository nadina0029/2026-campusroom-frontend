import React, { useState } from 'react';
import api from '../api/axiosInstance';
import Swal from 'sweetalert2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomId: number;
  onSuccess: () => void;
}

const BookingModal: React.FC<Props> = ({ isOpen, onClose, roomName, roomId, onSuccess }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    purpose: ''
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/Bookings', {
        roomId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Diajukan!',
        text: 'Permintaan peminjaman Anda sedang diproses oleh admin.',
        background: '#0f172a', 
        color: '#fff', 
        confirmButtonColor: '#6366f1'
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Pengajuan Gagal',
        text: error.response?.data || 'Jadwal mungkin bertabrakan dengan peminjaman lain.',
        background: '#0f172a', 
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      {/* INJECT CSS UNTUK MERUBAH WARNA ICON KALENDER */}
      <style>
        {`
          input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
          }
        `}
      </style>

      <div style={styles.glassModal}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>📅 Form <span style={styles.accentText}>Peminjaman</span></h2>
            <p style={styles.roomSubtitle}>{roomName}</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleBooking} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Waktu Mulai</label>
            <input 
              type="datetime-local" 
              style={styles.input} 
              required
              onChange={e => setFormData({...formData, startTime: e.target.value})}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Waktu Selesai</label>
            <input 
              type="datetime-local" 
              style={styles.input} 
              required
              onChange={e => setFormData({...formData, endTime: e.target.value})}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Keperluan / Alasan</label>
            <textarea 
              placeholder="Sebutkan kegiatan Anda secara rinci..."
              style={{...styles.input, minHeight: '100px', resize: 'none'}} 
              required
              onChange={e => setFormData({...formData, purpose: e.target.value})}
            />
          </div>

          <div style={styles.infoBox}>
             <span style={{ marginRight: '8px' }}>ℹ️</span> 
             Pastikan jadwal tidak bentrok dengan agenda lainnya.
          </div>

          <button type="submit" style={styles.submitBtn}>AJUKAN PEMINJAMAN</button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: { 
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
    backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
  },
  glassModal: { 
    backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px)', 
    width: '90%', maxWidth: '450px', borderRadius: '28px', padding: '40px', 
    border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
  title: { color: '#fff', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' },
  accentText: { background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  roomSubtitle: { color: '#ffffff', margin: '8px 0 0 0', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' },
  closeBtn: { background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '22px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#38bdf8', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' },
  input: { 
    padding: '14px 16px', backgroundColor: 'rgba(2, 6, 23, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '14px', color: '#fff', outline: 'none', fontSize: '14px', transition: '0.3s', fontFamily: 'inherit'
  },
  infoBox: { 
    padding: '14px', backgroundColor: 'rgba(56, 189, 248, 0.05)', color: '#cbd5e1', 
    borderRadius: '14px', fontSize: '12px', border: '1px solid rgba(56, 189, 248, 0.1)',
    lineHeight: '1.5'
  },
  submitBtn: { 
    padding: '16px', background: 'linear-gradient(to right, #6366f1, #22d3ee)', 
    color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', 
    cursor: 'pointer', transition: '0.3s', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
    letterSpacing: '1px', marginTop: '5px'
  }
};

export default BookingModal;