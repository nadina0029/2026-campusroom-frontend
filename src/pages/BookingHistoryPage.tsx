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
        const adminStatus = user?.toLowerCase().includes('admin') || false;
        setIsAdmin(adminStatus);
        
        // Panggil fetchBookings setelah status admin ditentukan
        fetchBookings(adminStatus);
    }, []);

    const fetchBookings = async (adminRole: boolean) => {
        setLoading(true);
        try {
            // Tentukan endpoint berdasarkan role user sesuai backend kamu
            const endpoint = adminRole ? '/Bookings/all' : '/Bookings/my-bookings';

            const response = await api.get<Booking[]>(endpoint);
            console.log("Data diterima dari DB:", response.data);
            setBookings(response.data);
        } catch (error: any) {
            console.error("Gagal memuat riwayat:", error);

            if (error.response?.status === 405) {
                alert("Error 405: Endpoint tidak mendukung Method GET. Cek [HttpGet] di Controller.");
            } else if (error.response?.status === 401) {
                alert("Sesi habis, silakan login kembali.");
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fungsi khusus Admin untuk Update Status (Approve/Reject)
    const updateStatus = async (id: number, newStatus: string) => {
        try {
            // Pastikan endpoint PUT ini sesuai dengan controller backend kamu
            await api.put(`/Bookings/${id}/status`, { status: newStatus });
            alert(`✅ Peminjaman berhasil di-${newStatus}`);
            fetchBookings(isAdmin); // Refresh data
        } catch (error) {
            console.error(error);
            alert("❌ Gagal memperbarui status.");
        }
    };

    // Logika Filter Pencarian (Client-side)
    const filteredBookings = bookings.filter(b => {
        // Mendukung PascalCase dari database
        const roomName = b.roomName || b.Room?.Name || ""; 
        const purpose = b.purpose || b.Purpose || "";
        
        return roomName.toLowerCase().includes(searchHistory.toLowerCase()) ||
               purpose.toLowerCase().includes(searchHistory.toLowerCase());
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            
            {/* Header & Navigasi */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0 }}>📋 Riwayat Peminjaman</h1>
                    <p style={{ color: '#666', marginTop: '5px' }}>
                        {isAdmin ? 'Mode Admin: Pantau dan kelola semua peminjaman.' : 'Mode Mahasiswa: Pantau status peminjaman kamu.'}
                    </p>
                </div>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                    ← Kembali ke Dashboard
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '25px' }}>
                <input
                    placeholder="Cari berdasarkan ruangan atau keperluan..."
                    style={styles.searchInput}
                    value={searchHistory}
                    onChange={(e) => setSearchHistory(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <p>Sedang sinkronisasi riwayat...</p>
                </div>
            ) : (
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
                            {filteredBookings.map((b) => {
                                // Penanganan Case Sensitivity properti database
                                const status = b.status || b.Status;
                                const purpose = b.purpose || b.Purpose;
                                const sTime = b.startTime || b.StartTime;
                                const eTime = b.endTime || b.EndTime;
                                const bId = b.id || b.Id;

                                return (
                                    <tr key={bId} style={styles.tr}>
                                        <td style={styles.td}>{new Date(sTime).toLocaleString()}</td>
                                        <td style={styles.td}>{new Date(eTime).toLocaleString()}</td>
                                        <td style={styles.td}>{purpose}</td>
                                        <td style={styles.td}>
                                            <span style={
                                                status === 'Approved' ? styles.statusApprove : 
                                                status === 'Pending' ? styles.statusPending : 
                                                styles.statusReject
                                            }>
                                                {status}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td style={styles.td}>
                                                {status === 'Pending' && (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button 
                                                            onClick={() => updateStatus(bId, 'Approved')} 
                                                            style={styles.btnApprove}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => updateStatus(bId, 'Rejected')} 
                                                            style={styles.btnReject}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    {filteredBookings.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                            Tidak ada riwayat peminjaman ditemukan.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    tableCard: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
    },
    th: { 
        padding: '18px 16px', 
        borderBottom: '2px solid #edf2f7', 
        color: '#4a5568', 
        fontSize: '13px', 
        fontWeight: 'bold', 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px' 
    },
    td: { padding: '16px', fontSize: '14px', color: '#2d3748' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
    backBtn: { 
        padding: '10px 18px', 
        cursor: 'pointer', 
        borderRadius: '8px', 
        border: '1px solid #3182ce', 
        backgroundColor: 'white', 
        color: '#3182ce',
        fontWeight: '600',
        transition: '0.2s'
    },
    searchInput: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #cbd5e0',
        width: '100%',
        maxWidth: '400px',
        fontSize: '15px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
    },
    // Status Badge Styles
    statusApprove: { backgroundColor: '#c6f6d5', color: '#22543d', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' },
    statusPending: { backgroundColor: '#fef3c7', color: '#92400e', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' },
    statusReject: { backgroundColor: '#fed7d7', color: '#822727', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' },
    
    // Admin Button Styles
    btnApprove: { backgroundColor: '#48bb78', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
    btnReject: { backgroundColor: '#f56565', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }
};

export default BookingHistoryPage;