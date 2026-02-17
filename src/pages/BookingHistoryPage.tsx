import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { Booking } from '../types/auth';
import Swal from 'sweetalert2';

const BookingHistoryPage = () => {
    const navigate = useNavigate();
    
    // --- STATE MANAGEMENT ---
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Konfigurasi Dasar Body
    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.background = "#020617";
        document.body.style.minHeight = "100vh";
        document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        document.body.style.color = "#f8fafc";
        document.body.style.overflowX = "hidden";
    }, []);

    useEffect(() => {
        const user = localStorage.getItem('username');
        const adminStatus = user?.toLowerCase().includes('admin') || false;
        setIsAdmin(adminStatus);
        fetchBookings(adminStatus);
    }, []);

    const fetchBookings = async (adminRole: boolean) => {
        setLoading(true);
        try {
            const endpoint = adminRole ? '/Bookings/all' : '/Bookings/my-bookings';
            const response = await api.get<Booking[]>(endpoint);
            setBookings(response.data);
        } catch (error: any) {
            console.error("Gagal memuat riwayat:", error);
            if (error.response?.status === 401) navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        const actionText = newStatus === 'Approved' ? 'menyetujui' : 'menolak';
        
        Swal.fire({
            title: `Konfirmasi ${newStatus}?`,
            text: `Apakah Anda yakin ingin ${actionText} peminjaman ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'Approved' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Ya, Lanjutkan',
            cancelButtonText: 'Batal',
            background: '#0f172a',
            color: '#fff'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.put(`/Bookings/${id}/status`, { status: newStatus });
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        background: '#0f172a',
                        color: '#fff',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    fetchBookings(isAdmin);
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Gagal', background: '#0f172a', color: '#fff' });
                }
            }
        });
    };

    const getSafeData = (booking: Booking) => {
        const rawRoom = booking.room as any;
        const rawUser = booking.user as any;
        const roomName = rawRoom?.Name || rawRoom?.name || booking.roomName || '-';
        const userName = rawUser?.Username || rawUser?.username || booking.userName || '-';
        return { roomName, userName };
    };

    const filteredBookings = bookings.filter((b) => {
        const { roomName, userName } = getSafeData(b);
        const purpose = (b.purpose || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        const matchesSearch = roomName.toLowerCase().includes(term) || purpose.includes(term) || userName.toLowerCase().includes(term);
        const status = (b.status || '').toLowerCase();
        const matchesStatus = statusFilter === 'all' ? true : status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusLabel = () => {
        if (statusFilter === 'all') return 'SEMUA STATUS';
        return statusFilter.toUpperCase();
    };

    return (
        <div style={styles.pageContainer}>
            {/* Aurora Background Effects */}
            <div style={styles.glowTopRight}></div>
            <div style={styles.glowBottomLeft}></div>

            {/* --- NAVBAR --- */}
            <nav style={styles.navbar}>
                <div style={styles.navBrand}>
                    <div style={styles.iconBox}>📜</div>
                    <div style={styles.brandText}>
                        <span style={styles.brandPrimary}>DAFTAR</span>
                        <span style={styles.brandSecondary}>PEMINJAMAN</span>
                    </div>
                </div>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                    KEMBALI KE DASHBOARD
                </button>
            </nav>

            <div style={styles.content}>
                {/* --- HEADER --- */}
                <div style={styles.headerSection}>
                    <div style={styles.titleGroup}>
                        <h1 style={styles.mainTitle}>Daftar <span style={styles.accentText}>Peminjaman</span></h1>
                        <p style={styles.mainSubtitle}>
                            {isAdmin ? 'Mengelola pengajuan peminjaman ruangan oleh mahasiswa.' : 'Daftar pengajuan peminjaman ruangan yang Anda lakukan.'}
                        </p>
                    </div>
                </div>

                {/* --- FILTER & SEARCH --- */}
                <div style={styles.searchBarRow}>
                    <div style={styles.searchWrapper}>
                        <input
                            placeholder="Cari nama ruangan atau keperluan peminjaman..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span style={styles.searchIcon}>🔍</span>
                    </div>

                    {/* Custom Dropdown */}
                    <div style={styles.customSelectWrapper}>
                        <div style={styles.selectHeader} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <span>{getStatusLabel()}</span>
                            <span style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>▼</span>
                        </div>
                        {isDropdownOpen && (
                            <div style={styles.selectMenu}>
                                <div style={styles.selectOption} onClick={() => { setStatusFilter('all'); setIsDropdownOpen(false); }}>🌐 SEMUA STATUS</div>
                                <div style={styles.selectOption} onClick={() => { setStatusFilter('pending'); setIsDropdownOpen(false); }}>⏳ PENDING</div>
                                <div style={styles.selectOption} onClick={() => { setStatusFilter('approved'); setIsDropdownOpen(false); }}>✅ APPROVED</div>
                                <div style={styles.selectOption} onClick={() => { setStatusFilter('rejected'); setIsDropdownOpen(false); }}>❌ REJECTED</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- TABLE CARD --- */}
                <div style={styles.glassTableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Ruangan</th>
                                {isAdmin && <th style={styles.th}>Peminjam</th>} 
                                <th style={styles.th}>Waktu & Durasi</th>
                                <th style={styles.th}>Keperluan</th>
                                <th style={styles.th}>Status</th>
                                {isAdmin && <th style={styles.th}>Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={isAdmin ? 6 : 5} style={styles.loadingText}>MENYINKRONKAN...</td></tr>
                            ) : filteredBookings.map((b) => {
                                const { roomName, userName } = getSafeData(b);
                                return (
                                    <tr key={b.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.roomLabel}>{roomName}</div>
                                        </td>
                                        {isAdmin && (
                                            <td style={styles.td}>
                                                <div style={styles.userNameText}>{userName}</div>
                                            </td>
                                        )}
                                        <td style={styles.td}>
                                            <div style={styles.dateTimeText}>{new Date(b.startTime).toLocaleString('id-ID')}</div>
                                            <div style={styles.subDateTime}>Hingga {new Date(b.endTime).toLocaleString('id-ID')}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.techText}>{b.purpose}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={
                                                b.status === 'Approved' ? styles.badgeApprove : 
                                                b.status === 'Pending' ? styles.badgePending : 
                                                styles.badgeReject
                                            }>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td style={styles.td}>
                                                {b.status === 'Pending' ? (
                                                    <div style={styles.adminActionGroup}>
                                                        <button onClick={() => updateStatus(b.id, 'Approved')} style={styles.approveBtn}>✓</button>
                                                        <button onClick={() => updateStatus(b.id, 'Rejected')} style={styles.rejectBtn}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div style={{fontSize: '10px', color: '#475569', fontWeight: 'bold'}}>CLOSED</div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {!loading && filteredBookings.length === 0 && (
                        <div style={{padding: '40px', textAlign: 'center', color: '#60a5fa', fontWeight: 'bold'}}>Data peminjaman tidak ditemukan.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { width: '100%', minHeight: '100vh', position: 'relative', background: '#020617', zIndex: 1, overflowX: 'hidden' },
    glowTopRight: { position: 'absolute', top: '-150px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)', zIndex: -1 },
    glowBottomLeft: { position: 'absolute', bottom: '-200px', left: '-150px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 70%)', zIndex: -1 },
    
    navbar: { backgroundColor: '#0f172a', backdropFilter: 'blur(20px)', padding: '15px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 100 },
    navBrand: { display: 'flex', alignItems: 'center', gap: '15px' },
    iconBox: { background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '18px' },
    brandText: { display: 'flex', flexDirection: 'column', lineHeight: '1.2' },
    brandPrimary: { fontSize: '16px', fontWeight: '900', letterSpacing: '1px', color: '#fff' },
    brandSecondary: { fontSize: '9px', fontWeight: 'bold', color: '#38bdf8' },
    backBtn: { padding: '8px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '10px', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px' },

    content: { maxWidth: '1250px', width: '90%', margin: '30px auto' },
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
    titleGroup: { maxWidth: '600px' },
    mainTitle: { fontSize: '42px', color: '#fff', margin: 0, fontWeight: '900', letterSpacing: '-1px', textShadow: '0 10px 20px rgba(0,0,0,0.3)' },
    accentText: { background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    mainSubtitle: { color: '#cbd5e1', marginTop: '10px', fontSize: '16px', fontWeight: '500' },

    searchBarRow: { display: 'flex', gap: '15px', marginBottom: '25px' },
    searchWrapper: { position: 'relative', flex: 1 },
    searchIcon: { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#60a5fa', opacity: 0.8 },
    searchInput: { width: '100%', padding: '14px 20px 14px 45px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#fff', outline: 'none', fontSize: '14px' },
    
    customSelectWrapper: { position: 'relative', width: '250px' },
    selectHeader: { padding: '14px 20px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    selectMenu: { position: 'absolute', top: '110%', left: 0, width: '100%', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
    selectOption: { padding: '12px 20px', color: '#cbd5e1', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' },

    glassTableContainer: { backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.04)', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '20px', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tr: { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', transition: '0.2s' },
    td: { padding: '20px', verticalAlign: 'middle' },
    loadingText: { textAlign: 'center', padding: '100px', color: '#60a5fa', letterSpacing: '8px', fontWeight: '900', fontSize: '18px' },
    
    roomLabel: { fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '3px' },
    roomCode: { fontSize: '9px', color: '#38bdf8', fontWeight: 'bold' },
    userNameText: { color: '#38bdf8', fontWeight: 'bold', fontSize: '14px' },
    dateTimeText: { color: '#f8fafc', fontSize: '13px', fontWeight: 'bold' },
    subDateTime: { color: '#94a3b8', fontSize: '11px', marginTop: '2px' },
    techText: { color: '#cbd5e1', fontSize: '13px', maxWidth: '300px', lineHeight: '1.5' },
    
    badgeApprove: { display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.1)' },
    badgePending: { display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.1)' },
    badgeReject: { display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.1)' },
    
    adminActionGroup: { display: 'flex', gap: '8px' },
    approveBtn: { background: '#10b981', color: '#fff', border: 'none', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    rejectBtn: { background: '#ef4444', color: '#fff', border: 'none', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    emptyState: { padding: '40px', textAlign: 'center', color: '#60a5fa', fontWeight: 'bold' }
};

export default BookingHistoryPage;