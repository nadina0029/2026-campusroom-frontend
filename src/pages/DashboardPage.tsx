import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { Room } from '../types/auth';
import RoomModal from '../components/RoomModal';
import BookingModal from '../components/BookingModal';
import Swal from 'sweetalert2';

const DashboardPage = () => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Room | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [roomToBook, setRoomToBook] = useState<Room | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // State untuk Custom Dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('username');

        if (!token) {
            navigate('/');
        } else {
            const currentUser = user || '';
            setUsername(currentUser);
            setIsAdmin(currentUser.toLowerCase().includes('admin'));
            fetchRooms();
        }
    }, [navigate]);

    const fetchRooms = async () => {
        try {
            const response = await api.get<Room[]>('/Rooms');
            setRooms(response.data);
        } catch (error) {
            console.error("Kesalahan API:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRoomStatus = async (room: Room) => {
        try {
            const updatedStatus = !room.isAvailable;
            await api.put(`/Rooms/${room.id}`, { ...room, isAvailable: updatedStatus });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil Diperbarui!',
                background: '#0f172a',
                color: '#fff',
                timer: 1000,
                showConfirmButton: false
            });
            fetchRooms();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Gagal', background: '#0f172a', color: '#fff' });
        }
    };

    const handleDelete = async (id: number) => {
        Swal.fire({
            title: 'Hapus Ruangan?',
            text: "Data akan dihapus secara permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            background: '#0f172a',
            color: '#fff',
            confirmButtonText: 'Ya, Hapus'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/Rooms/${id}`);
                    fetchRooms();
                } catch (error) {
                    Swal.fire('Gagal', 'Akses ditolak.', 'error');
                }
            }
        });
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'available' ? room.isAvailable : !room.isAvailable;
        return matchesSearch && matchesStatus;
    });

    // Helper Label Dropdown
    const getStatusLabel = () => {
        if (statusFilter === 'all') return 'SEMUA STATUS';
        if (statusFilter === 'available') return 'SIAP DIGUNAKAN';
        return 'SEDANG DIPAKAI';
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.glowTopRight}></div>
            <div style={styles.glowBottomLeft}></div>

            {/* --- NAVBAR --- */}
            <nav style={styles.navbar}>
                <div style={styles.navBrand}>
                    <div style={styles.iconBox}>{isAdmin ? '🛡️' : '🎓'}</div>
                    <div style={styles.brandText}>
                        <span style={styles.brandPrimary}>KAMPUS</span>
                        <span style={styles.brandSecondary}>{isAdmin ? 'PENGELOLAAN SISTEM PEMINJAMAN RUANG KAMPUS' : 'PEMINJAMAN RUANG KAMPUS'}</span>
                    </div>
                </div>
                
                <div style={styles.navUserGroup}>
                    <div style={styles.userProfile}>
                        <div style={styles.userInfo}>
                            <span style={styles.userName}>{username}</span>
                            <span style={styles.userStatus}>{isAdmin ? 'ADMIN' : 'MAHASISWA'}</span>
                        </div>
                        <div style={styles.avatar}>{username.charAt(0).toUpperCase()}</div>
                    </div>
                    <div style={styles.navDivider}></div>
                    <button onClick={handleLogout} style={styles.logoutBtn}>LOGOUT</button>
                </div>
            </nav>

            <div style={styles.content}>
                <div style={styles.headerSection}>
                    <div style={styles.titleGroup}>
                        <h1 style={styles.mainTitle}>Daftar <span style={styles.accentText}>Ruangan kampus</span></h1>
                        <p style={styles.mainSubtitle}>Informasi ruangan-ruangan yang ada di kampus.</p>
                    </div>
                    <div style={styles.topActions}>
                        <button style={styles.historyBtn} onClick={() => navigate('/history')}>📜 RIWAYAT PEMINJAMAN</button>
                        {isAdmin && (
                            <button style={styles.addBtn} onClick={() => {setSelectedRoomForEdit(null); setIsRoomModalOpen(true);}}>＋ RUANGAN BARU</button>
                        )}
                    </div>
                </div>

                <div style={styles.searchBarRow}>
                    <div style={styles.searchWrapper}>
                        <input
                            placeholder="Cari berdasarkan nama atau kapasitas ruangan..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span style={styles.searchIcon}>🔍</span>
                    </div>

                    {/* --- CUSTOM LUXURY DROPDOWN --- */}
                    <div style={styles.customSelectWrapper}>
                        <div 
                            style={styles.selectHeader} 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>{getStatusLabel()}</span>
                            <span style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>▼</span>
                        </div>

                        {isDropdownOpen && (
                            <div style={styles.selectMenu}>
                                <div 
                                    style={styles.selectOption} 
                                    onClick={() => { setStatusFilter('all'); setIsDropdownOpen(false); }}
                                >
                                    🌐 SEMUA STATUS
                                </div>
                                <div 
                                    style={styles.selectOption} 
                                    onClick={() => { setStatusFilter('available'); setIsDropdownOpen(false); }}
                                >
                                    🟢 TERSEDIA
                                </div>
                                <div 
                                    style={{...styles.selectOption, borderBottom: 'none'}} 
                                    onClick={() => { setStatusFilter('busy'); setIsDropdownOpen(false); }}
                                >
                                    🔴 TIDAK TERSEDIA
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.glassTableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Nama Ruangan</th>
                                <th style={styles.th}>Kapasitas</th>
                                <th style={styles.th}>Fasilitas</th>
                                <th style={styles.th}>Ketersediaan</th>
                                <th style={styles.th}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={styles.loadingText}>MENYINKRONKAN...</td></tr>
                            ) : filteredRooms.map((room) => (
                                <tr key={room.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.roomLabel}>{room.name}</div>
                                    </td>
                                    <td style={styles.td}><div style={styles.paxTag}>{room.capacity} ORANG</div></td>
                                    <td style={styles.td}><div style={styles.techText}>{room.facilities}</div></td>
                                    <td style={styles.td}>
                                        <div style={room.isAvailable ? styles.statusActive : styles.statusBusy}>
                                            {room.isAvailable ? 'TERSEDIA' : 'TIDAK TERSEDIA'}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        {isAdmin ? (
                                            <div style={styles.adminActionGroup}>
                                                <button style={room.isAvailable ? styles.lockBtn : styles.unlockBtn} onClick={() => toggleRoomStatus(room)}>{room.isAvailable ? '🔒' : '🔓'}</button>
                                                <button style={styles.editBtn} onClick={() => {setSelectedRoomForEdit(room); setIsRoomModalOpen(true);}}>EDIT</button>
                                                <button style={styles.deleteBtn} onClick={() => handleDelete(room.id)}>HAPUS</button>
                                            </div>
                                        ) : (
                                            <button
                                                style={room.isAvailable ? styles.bookBtn : styles.bookedBtn}
                                                disabled={!room.isAvailable}
                                                onClick={() => {setRoomToBook(room); setIsBookingModalOpen(true);}}
                                            >
                                                {room.isAvailable ? 'PINJAM' : 'TIDAK TERSEDIA'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <RoomModal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} onSuccess={fetchRooms} roomToEdit={selectedRoomForEdit} />
            {roomToBook && <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} roomName={roomToBook.name} roomId={roomToBook.id} onSuccess={fetchRooms} />}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { width: '100%', minHeight: '100vh', position: 'relative', background: '#020617', zIndex: 1, overflowX: 'hidden' },
    glowTopRight: { position: 'absolute', top: '-150px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)', zIndex: -1 },
    glowBottomLeft: { position: 'absolute', bottom: '-200px', left: '-150px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 70%)', zIndex: -1 },
    navbar: { backgroundColor: '#0f172a', backdropFilter: 'blur(20px)', padding: '15px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 100 },
    navBrand: { display: 'flex', alignItems: 'center', gap: '15px' },
    iconBox: { background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' },
    brandText: { display: 'flex', flexDirection: 'column', lineHeight: '1.2' },
    brandPrimary: { fontSize: '16px', fontWeight: '900', letterSpacing: '1px', color: '#fff' },
    brandSecondary: { fontSize: '9px', fontWeight: 'bold', color: '#6366f1' },
    navUserGroup: { display: 'flex', alignItems: 'center', gap: '20px' },
    userProfile: { display: 'flex', alignItems: 'center', gap: '12px' },
    userInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' },
    userName: { fontWeight: '800', color: '#fff', fontSize: '13px' },
    userStatus: { fontSize: '9px', color: '#38bdf8', fontWeight: '900' },
    avatar: { width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #22d3ee)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff', fontSize: '14px' },
    navDivider: { width: '1px', height: '25px', backgroundColor: 'rgba(255,255,255,0.1)' },
    logoutBtn: { background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '900', fontSize: '11px', cursor: 'pointer', letterSpacing: '1px' },
    content: { maxWidth: '1250px', width: '90%', margin: '30px auto' },
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
    mainTitle: { fontSize: '42px', color: '#fff', margin: 0, fontWeight: '900', letterSpacing: '-1px', textShadow: '0 10px 20px rgba(0,0,0,0.3)' },
    accentText: { background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    mainSubtitle: { color: '#cbd5e1', marginTop: '10px', fontSize: '16px', fontWeight: '500' },
    topActions: { display: 'flex', gap: '12px' },
    historyBtn: { padding: '10px 20px', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' },
    addBtn: { padding: '10px 24px', background: '#fff', color: '#020617', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '11px' },
    searchBarRow: { display: 'flex', gap: '15px', marginBottom: '25px' },
    searchWrapper: { position: 'relative', flex: 1 },
    searchIcon: { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#60a5fa', opacity: 0.8 },
    searchInput: { width: '100%', padding: '14px 20px 14px 45px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#fff', outline: 'none', fontSize: '14px' },
    
    // Custom Dropdown Styles
    customSelectWrapper: { position: 'relative', width: '250px' },
    selectHeader: { 
        padding: '14px 20px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.15)', 
        borderRadius: '14px', color: '#cbd5e1', fontWeight: 'bold', fontSize: '11px', 
        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
    },
    selectMenu: { 
        position: 'absolute', top: '110%', left: 0, width: '100%', 
        background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(15px)', 
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', 
        zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
    },
    selectOption: { 
        padding: '12px 20px', color: '#cbd5e1', fontSize: '11px', fontWeight: 'bold', 
        cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s',
        // Hover effect dikelola via CSS inline atau class, di sini kita buat sederhana
    },

    glassTableContainer: { backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(10px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.04)', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '20px', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tr: { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', transition: '0.2s' },
    td: { padding: '20px', verticalAlign: 'middle' },
    loadingText: { textAlign: 'center', padding: '100px', color: '#60a5fa', letterSpacing: '8px', fontWeight: '900', fontSize: '18px' },
    roomLabel: { fontSize: '17px', fontWeight: '800', color: '#fff', marginBottom: '3px' },
    roomCode: { fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' },
    paxTag: { display: 'inline-block', padding: '5px 12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '11px', fontWeight: 'bold', color: '#7dd3fc' },
    techText: { color: '#cbd5e1', fontSize: '13px', maxWidth: '240px', lineHeight: '1.5' },
    statusActive: { display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.1)' },
    statusBusy: { display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: '10px', fontSize: '9px', fontWeight: '900', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.1)' },
    adminActionGroup: { display: 'flex', gap: '8px' },
    editBtn: { background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' },
    deleteBtn: { background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' },
    lockBtn: { background: '#1e293b', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' },
    unlockBtn: { background: '#6366f1', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' },
    bookBtn: { width: '100%', padding: '12px', background: 'linear-gradient(to right, #6366f1, #22d3ee)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
    bookedBtn: { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'not-allowed', fontSize: '12px' }
};

export default DashboardPage;