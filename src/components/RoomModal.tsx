import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import type { Room } from '../types/auth';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomToEdit?: Room | null; // Kalau null berarti mode "Tambah", kalau ada isinya berarti "Edit"
}

const RoomModal = ({ isOpen, onClose, onSuccess, roomToEdit }: RoomModalProps) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [facilities, setFacilities] = useState('');
  const [loading, setLoading] = useState(false);

  // Efek: Kalau modal dibuka, cek apakah ini mode Edit atau Tambah
  useEffect(() => {
    if (roomToEdit) {
      setName(roomToEdit.name);
      setCapacity(roomToEdit.capacity.toString());
      setFacilities(roomToEdit.facilities);
    } else {
      // Reset form kalau mode tambah
      setName('');
      setCapacity('');
      setFacilities('');
    }
  }, [roomToEdit, isOpen]);

  if (!isOpen) return null; // Jangan tampilkan apa-apa kalau modal tertutup

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const roomData = {
      name,
      capacity: parseInt(capacity),
      facilities,
      isAvailable: true // Default true kalau buat baru
    };

    try {
      if (roomToEdit) {
        // --- MODE EDIT (PUT) ---
        // Pastikan endpoint backendmu menerima ID di URL (misal: PUT /api/Rooms/5)
        // Dan body requestnya juga harus menyertakan ID jika required
        await api.put(`/Rooms/${roomToEdit.id}`, { ...roomData, id: roomToEdit.id, isAvailable: roomToEdit.isAvailable });
        alert('Ruangan berhasil diupdate!');
      } else {
        // --- MODE TAMBAH (POST) ---
        await api.post('/Rooms', roomData);
        alert('Ruangan berhasil ditambahkan!');
      }
      onSuccess(); // Refresh data di dashboard
      onClose();   // Tutup modal
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan data. Cek console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay Hitam Transparan
    <div style={styles.overlay}>
      {/* Kotak Modal Putih */}
      <div style={styles.modal}>
        <h2 style={{ marginBottom: 20 }}>
          {roomToEdit ? '✏️ Edit Ruangan' : '➕ Tambah Ruangan Baru'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Ruangan</label>
            <input 
              style={styles.input} 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Contoh: Lab Komputer B" 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Kapasitas (Orang)</label>
            <input 
              style={styles.input} 
              type="number"
              value={capacity} 
              onChange={(e) => setCapacity(e.target.value)} 
              placeholder="Contoh: 40" 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Fasilitas</label>
            <textarea 
              style={{...styles.input, height: 80}} 
              value={facilities} 
              onChange={(e) => setFacilities(e.target.value)} 
              placeholder="Contoh: AC, Proyektor, Whiteboard" 
              required 
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Batal</button>
            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modal: {
    backgroundColor: 'white', padding: 30, borderRadius: 12, width: '90%', maxWidth: 500,
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
  },
  inputGroup: { marginBottom: 15 },
  label: { display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14, color: '#444' },
  input: { width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: 6, cursor: 'pointer' },
  saveBtn: { padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }
};

export default RoomModal;