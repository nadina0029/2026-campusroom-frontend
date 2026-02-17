import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { Booking } from '../types/auth';

const BookingHistoryPage = () => {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // State Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // --- EFFECT ---
    useEffect(() => {
        const user = localStorage.getItem('username');
        const adminStatus = user?.toLowerCase().includes('admin') || false;
        setIsAdmin(adminStatus);
        
        fetchBookings(adminStatus);
    }, []);

    // --- API HANDLER ---
    const fetchBookings = async (adminRole: boolean) => {
        setLoading(true);
        try {
            const endpoint = adminRole ? '/Bookings/all' : '/Bookings/my-bookings';
            const response = await api.get<Booking[]>(endpoint);
            console.log("Full Data Response:", response.data); // Cek console browser!
            setBookings(response.data);
        } catch (error: any) {
            console.error("Gagal memuat riwayat:", error);
            if (error.response?.status === 405) {
                alert("Error 405: Cek method [HttpGet] di Backend.");
            } else if (error.response?.status === 401) {
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            await api.put(`/Bookings/${id}/status`, { status: newStatus });
            alert(`✅ Status berhasil diubah menjadi: ${newStatus}`);
            fetchBookings(isAdmin);
        } catch (error) {
            console.error(error);
            alert("❌ Gagal update status.");
        }
    };

    // --- HELPER: AMBIL NAMA DENGAN AMAN ---
    // Fungsi ini mencoba membaca 'Name' (C#) dan 'name' (JS) sekaligus
    const getSafeData = (booking: Booking) => {
        // Kita pakai 'as any' untuk bypass pengecekan ketat TypeScript sementara
        const rawRoom = booking.room as any;
        const rawUser = booking.user as any;

        const roomName = rawRoom?.Name || rawRoom?.name || booking.roomName || '-';
        const userName = rawUser?.Username || rawUser?.username || booking.userName || '-';
        
        return { roomName, userName };
    };

    // --- LOGIKA FILTER ---
    const filteredBookings = bookings.filter((b) => {
        const { roomName, userName } = getSafeData(b);
        const purpose = (b.purpose || '').toLowerCase();
        const term = searchTerm.toLowerCase();

        // 1. Filter Search
        const matchesSearch = 
            roomName.toLowerCase().includes(term) || 
            purpose.includes(term) || 
            userName.toLowerCase().includes(term);

        // 2. Filter Status
        const status = (b.status || '').toLowerCase();
        const matchesStatus = statusFilter === 'all' 
            ? true 
            : status === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div style={styles.pageContainer}>
            
            {/* HEADER */}
            <div style={styles.headerRow}>
                <div>
                    <h1 style={styles.title}>📋 Riwayat Peminjaman</h1>
                    <p style={styles.subtitle}>
                        {isAdmin ? 'Pantau aktivitas peminjaman mahasiswa.' : 'Daftar pengajuan peminjamanmu.'}
                    </p>
                </div>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                    ← Kembali
                </button>
            </div>

            {/* --- FILTER BAR --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '1000px', margin: '0 auto 20px auto' }}>
                <input 
                    type="text" 
                    placeholder={isAdmin ? "Cari ruangan, mahasiswa, atau keperluan..." : "Cari ruangan atau keperluan..."}
                    style={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    style={styles.selectInput}
                >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* TABLE */}
            {loading ? (
                <p style={{textAlign: 'center', padding: 20}}>Memuat data...</p>
            ) : (
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                                <th style={styles.th}>Ruangan</th>
                                {isAdmin && <th style={styles.th}>Peminjam</th>} 
                                
                                <th style={styles.th}>Waktu Mulai</th>
                                <th style={styles.th}>Waktu Selesai</th>
                                <th style={styles.th}>Keperluan</th>
                                <th style={styles.th}>Status</th>
                                {isAdmin && <th style={styles.th}>Aksi Admin</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((b) => {
                                // Ambil data menggunakan Helper Function kita
                                const { roomName, userName } = getSafeData(b);
                                
                                return (
                                    <tr key={b.id} style={styles.tr}>
                                        {/* Nama Ruangan */}
                                        <td style={{...styles.td, fontWeight: 'bold'}}>{roomName}</td>
                                        
                                        {/* Nama Peminjam (Hanya Admin) */}
                                        {isAdmin && (
                                            <td style={{...styles.td, color: '#3182ce'}}>{userName}</td>
                                        )}

                                        <td style={styles.td}>{new Date(b.startTime).toLocaleString()}</td>
                                        <td style={styles.td}>{new Date(b.endTime).toLocaleString()}</td>
                                        <td style={styles.td}>{b.purpose}</td>
                                        
                                        {/* Status Badge */}
                                        <td style={styles.td}>
                                            <span style={
                                                b.status === 'Approved' ? styles.statusApprove : 
                                                b.status === 'Pending' ? styles.statusPending : 
                                                styles.statusReject
                                            }>
                                                {b.status}
                                            </span>
                                        </td>

                                        {/* Tombol Aksi Admin */}
                                        {isAdmin && (
                                            <td style={styles.td}>
                                                {b.status === 'Pending' && (
                                                    <div style={{display: 'flex', gap: '5px'}}>
                                                        <button onClick={() => updateStatus(b.id, 'Approved')} style={styles.btnApprove}>✓</button>
                                                        <button onClick={() => updateStatus(b.id, 'Rejected')} style={styles.btnReject}>✕</button>
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
                        <div style={{padding: '40px', textAlign: 'center', color: '#888'}}>
                            Tidak ada data yang cocok.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { minHeight: '100vh', backgroundColor: '#f4f7fe', padding: '40px 20px', fontFamily: 'sans-serif' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', maxWidth: '1000px', margin: '0 auto 20px auto' },
    title: { fontSize: '26px', fontWeight: 'bold', color: '#2d3748', margin: 0 },
    subtitle: { color: '#718096', fontSize: '14px', marginTop: '5px' },
    backBtn: { padding: '8px 16px', border: '1px solid #cbd5e0', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#4a5568' },
    
    searchInput: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '300px', fontSize: '14px', marginLeft: 'auto', marginRight: 0 },
    selectInput: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' },
    
    tableCard: { maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '16px', backgroundColor: '#f7fafc', borderBottom: '2px solid #edf2f7', color: '#4a5568', fontWeight: 'bold', fontSize: '13px', textAlign: 'left' },
    tr: { borderBottom: '1px solid #edf2f7' },
    td: { padding: '16px', fontSize: '14px', color: '#2d3748' },
    
    statusApprove: { backgroundColor: '#c6f6d5', color: '#22543d', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
    statusPending: { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
    statusReject: { backgroundColor: '#fed7d7', color: '#822727', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
    btnApprove: { backgroundColor: '#48bb78', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    btnReject: { backgroundColor: '#f56565', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
};

export default BookingHistoryPage;