import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { Booking } from '../types/auth';

const BookingHistoryPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchHistory, setSearchHistory] = useState('');

    useEffect(() => {
        const user = localStorage.getItem('username');
        setIsAdmin(user?.toLowerCase().includes('admin') || false);
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            // 1. Tentukan endpoint berdasarkan role user
            // Jika isAdmin true, tembak '/Bookings/all', jika false tembak '/Bookings/my-bookings'
            const endpoint = isAdmin ? '/Bookings/all' : '/Bookings/my-bookings';

            console.log(`Memanggil data dari: ${endpoint}`); // Debugging

            const response = await api.get<Booking[]>(endpoint);

            console.log("Data diterima:", response.data);
            setBookings(response.data);
        } catch (error: any) {
            console.error("Gagal memuat riwayat:", error);

            if (error.response?.status === 405) {
                alert("Error 405: Method GET tidak diizinkan. Cek kembali [HttpGet] di Controller.");
            } else if (error.response?.status === 401) {
                alert("Sesi habis, silakan login kembali.");
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fungsi khusus Admin untuk Update Status
    const updateStatus = async (id: number, newStatus: string) => {
        try {
            await api.put(`/Bookings/${id}/status`, { status: newStatus });
            alert(`Peminjaman berhasil di-${newStatus}`);
            fetchBookings(); // Refresh data
        } catch (error) {
            alert("Gagal memperbarui status.");
        }
    };

    const filteredBookings = bookings.filter(b => {
        const roomName = b.roomName || b.Room?.Name || ""; // Sesuaikan dengan hasil console.log sebelumnya
        const purpose = b.purpose || b.Purpose || "";
        return roomName.toLowerCase().includes(searchHistory.toLowerCase()) ||
            purpose.toLowerCase().includes(searchHistory.toLowerCase());
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h1>📋 Riwayat Peminjaman</h1>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>Kembali ke Dashboard</button>
            </div>
            <input
                placeholder="Cari riwayat (ruangan/keperluan)..."
                style={styles.searchInput}
                onChange={(e) => setSearchHistory(e.target.value)}
            />

            {loading ? <p>Memuat data...</p> : (
                <div style={styles.tableCard}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                                <th style={styles.th}>Waktu Mulai</th>
                                <th style={styles.th}>Waktu Selesai</th>
                                <th style={styles.th}>Keperluan</th>
                                <th style={styles.th}>Status</th>
                                {isAdmin && <th style={styles.th}>Aksi Admin</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((b) => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={styles.td}>{new Date(b.startTime).toLocaleString()}</td>
                                    <td style={styles.td}>{new Date(b.endTime).toLocaleString()}</td>
                                    <td style={styles.td}>{b.purpose}</td>
                                    <td style={styles.td}>
                                        <span style={b.status === 'Approved' ? styles.statusApprove : b.status === 'Pending' ? styles.statusPending : styles.statusReject}>
                                            {b.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td style={styles.td}>
                                            {b.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button onClick={() => updateStatus(b.id, 'Approved')} style={styles.btnApprove}>Approve</button>
                                                    <button onClick={() => updateStatus(b.id, 'Rejected')} style={styles.btnReject}>Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' },
    th: { padding: '16px', borderBottom: '2px solid #edf2f7', color: '#4a5568', fontSize: '14px' },
    td: { padding: '16px', fontSize: '14px' },
    backBtn: { padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white' },
    statusApprove: { backgroundColor: '#c6f6d5', color: '#22543d', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' as const, fontSize: '12px' },
    statusPending: { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' as const, fontSize: '12px' },
    statusReject: { backgroundColor: '#fed7d7', color: '#822727', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' as const, fontSize: '12px' },
    btnApprove: { backgroundColor: '#48bb78', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
    btnReject: { backgroundColor: '#f56565', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
    searchInput: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        width: '300px',
        fontSize: '14px'
    },
    selectInput: {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        backgroundColor: 'white'
    }
};

export default BookingHistoryPage;