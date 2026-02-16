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
    
    // State Filter (Sama seperti Dashboard)
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // State baru untuk dropdown status

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

    // --- LOGIKA FILTER GABUNGAN (SEARCH + STATUS) ---
    const filteredBookings = bookings.filter((b) => {
        // 1. Filter Text (Nama Ruangan / Keperluan)
        const term = searchTerm.toLowerCase();
        const roomName = (b.roomName || '').toLowerCase();
        const purpose = (b.purpose || '').toLowerCase();
        const matchesSearch = roomName.includes(term) || purpose.includes(term);

        // 2. Filter Status (Dropdown)
        const status = (b.status || '').toLowerCase();
        const matchesStatus = statusFilter === 'all' 
            ? true 
            : status === statusFilter.toLowerCase();

        // Gabungkan keduanya
        return matchesSearch && matchesStatus;
    });

    return (
        <div style={styles.pageContainer}>
            
            {/* HEADER */}
            <div style={styles.headerRow}>
                <div>
                    <h1 style={styles.title}>📋 Riwayat Peminjaman</h1>
                    <p style={styles.subtitle}>
                        {isAdmin ? 'Pantau semua aktivitas peminjaman.' : 'Daftar pengajuan peminjamanmu.'}
                    </p>
                </div>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                    ← Kembali
                </button>
            </div>

            {/* --- FILTER BAR (SAMA PERSIS DENGAN DASHBOARD) --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Cari ruangan atau keperluan..." 
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
                                <th style={styles.th}>Waktu Mulai</th>
                                <th style={styles.th}>Waktu Selesai</th>
                                <th style={styles.th}>Keperluan</th>
                                <th style={styles.th}>Status</th>
                                {isAdmin && <th style={styles.th}>Aksi Admin</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((b) => {
                                const sTime = b.startTime;
                                const eTime = b.endTime;
                                const purpose = b.purpose;
                                const status = b.status;
                                const bId = b.id;

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
                                                    <div style={{display: 'flex', gap: '5px'}}>
                                                        <button onClick={() => updateStatus(bId, 'Approved')} style={styles.btnApprove}>✓</button>
                                                        <button onClick={() => updateStatus(bId, 'Rejected')} style={styles.btnReject}>✕</button>
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
    
    // Style Filter (Sama dengan Dashboard)
    searchInput: { 
        padding: '10px', 
        borderRadius: '8px', 
        border: '1px solid #ddd', 
        width: '300px', 
        fontSize: '14px',
        marginLeft: 'auto', // Trik biar dia nempel ke kiri container tapi dalam flex row
        marginRight: 0 
    },
    selectInput: { 
        padding: '10px', 
        borderRadius: '8px', 
        border: '1px solid #ddd', 
        backgroundColor: 'white',
        cursor: 'pointer'
    },
    
    // Table Styles
    tableCard: { maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '16px', backgroundColor: '#f7fafc', borderBottom: '2px solid #edf2f7', color: '#4a5568', fontWeight: 'bold', fontSize: '13px', textAlign: 'left' },
    tr: { borderBottom: '1px solid #edf2f7' },
    td: { padding: '16px', fontSize: '14px', color: '#2d3748' },
    
    // Badges & Buttons
    statusApprove: { backgroundColor: '#c6f6d5', color: '#22543d', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
    statusPending: { backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
    statusReject: { backgroundColor: '#fed7d7', color: '#822727', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
    btnApprove: { backgroundColor: '#48bb78', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    btnReject: { backgroundColor: '#f56565', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
};

styles.searchInput = { ...styles.searchInput, marginLeft: '120px' }; // Reset margin left
styles.headerRow = { ...styles.headerRow, maxWidth: '1000px', margin: '0 auto 20px auto' };

export default BookingHistoryPage;