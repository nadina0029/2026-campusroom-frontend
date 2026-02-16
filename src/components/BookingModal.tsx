import { useState } from 'react';
import api from '../api/axiosInstance';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomName: string;
    roomId: number;
    onSuccess: () => void;
}

const BookingModal = ({ isOpen, onClose, roomName, roomId, onSuccess }: BookingModalProps) => {
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sesuaikan payload dengan kolom di image_6d6e26.png
            const bookingData = {
                roomId: roomId,
                // Gabungkan tanggal dan jam menjadi format ISO String yang disukai ASP.NET
                startTime: `${bookingDate}T${startTime}:00`,
                endTime: `${bookingDate}T${endTime}:00`,
                purpose: description, // Sesuaikan 'description' UI ke kolom 'Purpose' DB
            };

            console.log("Mengirim data ke backend:", bookingData);

            await api.post('/Bookings', bookingData);

            alert(`Berhasil meminjam ruangan ${roomName}!`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error Detail:", error.response?.data);
            const pesanError = error.response?.data?.message || 'Gagal meminjam. Cek kecocokan jadwal.';
            alert('Gagal: ' + pesanError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2>📅 Pinjam Ruangan</h2>
                    <p style={{ color: '#666', marginTop: 5 }}>Kamu akan meminjam: <b>{roomName}</b></p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Tanggal */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tanggal Peminjaman</label>
                        <input
                            type="date"
                            style={styles.input}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 15 }}>
                        {/* Jam Mulai */}
                        <div style={{ ...styles.inputGroup, flex: 1 }}>
                            <label style={styles.label}>Jam Mulai</label>
                            <input
                                type="time"
                                style={styles.input}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>

                        {/* Jam Selesai */}
                        <div style={{ ...styles.inputGroup, flex: 1 }}>
                            <label style={styles.label}>Jam Selesai</label>
                            <input
                                type="time"
                                style={styles.input}
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Keperluan */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Keperluan / Kegiatan</label>
                        <textarea
                            style={{ ...styles.input, height: 80 }}
                            placeholder="Contoh: Rapat Himpunan, Belajar Kelompok..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div style={styles.buttonGroup}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Batal</button>
                        <button type="submit" disabled={loading} style={styles.submitBtn}>
                            {loading ? 'Memproses...' : 'Ajukan Peminjaman'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    modal: {
        backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '450px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    },
    header: { textAlign: 'center', marginBottom: 20 },
    inputGroup: { marginBottom: 15 },
    label: { display: 'block', marginBottom: 8, fontWeight: '600', fontSize: '14px', color: '#4a5568' },
    input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '15px' },
    buttonGroup: { display: 'flex', gap: 10, marginTop: 25 },
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    submitBtn: { flex: 1, padding: '12px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default BookingModal;