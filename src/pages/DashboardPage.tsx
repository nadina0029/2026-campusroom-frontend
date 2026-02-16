import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { Room } from '../types/auth';
import RoomModal from '../components/RoomModal';
import BookingModal from '../components/BookingModal';

const DashboardPage = () => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    // State untuk Modal Admin (CRUD)
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Room | null>(null);

    // State untuk Modal Mahasiswa (Booking)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [roomToBook, setRoomToBook] = useState<Room | null>(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('username');

        if (!token) {
            navigate('/');
        } else {
            const currentUser = user || '';
            setUsername(currentUser);

            // Logic Role: Admin jika username mengandung kata 'admin'
            setIsAdmin(currentUser.toLowerCase().includes('admin'));

            fetchRooms();
        }
    }, [navigate]);

    // --- API HANDLERS ---
    const fetchRooms = async () => {
        try {
            const response = await api.get<Room[]>('/Rooms');
            setRooms(response.data);
        } catch (error) {
            console.error("Gagal mengambil data dari API:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('⚠️ Anda yakin ingin menghapus ruangan ini secara permanen?')) {
            try {
                await api.delete(`/Rooms/${id}`);
                alert('✅ Ruangan berhasil dihapus.');
                fetchRooms();
            } catch (error) {
                console.error(error);
                alert('❌ Gagal menghapus ruangan.');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // --- MODAL TRIGGERS ---
    const openAddModal = () => {
        setSelectedRoomForEdit(null);
        setIsRoomModalOpen(true);
    };

    const openEditModal = (room: Room) => {
        setSelectedRoomForEdit(room);
        setIsRoomModalOpen(true);
    };

    const openBookingModal = (room: Room) => {
        setRoomToBook(room);
        setIsBookingModalOpen(true);
    };

    return (
        <div style={styles.pageContainer}>

            {/* --- NAVIGATION BAR --- */}
            <nav style={isAdmin ? styles.navbarAdmin : styles.navbarUser}>
                <div style={styles.navBrand}>
                    {isAdmin ? '🛡️ CAMPUS ADMIN' : '🏛️ CAMPUS BOOKING'}
                    <button
                        onClick={() => navigate('/history')}
                        style={{ marginRight: '10px', padding: '1px 3px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        {isAdmin ? '📂 Kelola Pinjaman' : '📑 Riwayat Saya'}
                    </button>
                </div>
                <div style={styles.navUser}>
                    <span>Halo, <b>{username}</b></span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            {/* --- MAIN CONTENT --- */}
            <div style={styles.content}>

                <div style={styles.headerRow}>
                    <div>
                        <h1 style={styles.title}>Daftar Ruangan Kampus</h1>
                        <p style={styles.subtitle}>
                            {isAdmin ? 'Mode Administrator: Kelola data dan fasilitas ruangan.' : 'Mode Mahasiswa: Cari ruangan kosong untuk kegiatanmu.'}
                        </p>
                    </div>

                    {isAdmin && (
                        <button style={styles.addBtn} onClick={openAddModal}>
                            + Tambah Ruangan
                        </button>
                    )}
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>Sinkronisasi database...</p>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Nama Ruangan</th>
                                    <th style={styles.th}>Kapasitas</th>
                                    <th style={styles.th}>Fasilitas</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room) => (
                                    <tr key={room.id} style={styles.tr}>
                                        <td style={styles.td}><b>{room.name}</b></td>
                                        <td style={styles.td}>{room.capacity} Org</td>
                                        <td style={{ ...styles.td, maxWidth: '300px', fontSize: '13px', color: '#555' }}>
                                            {room.facilities}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={room.isAvailable ? styles.badgeAvailable : styles.badgeBusy}>
                                                {room.isAvailable ? 'Tersedia' : 'Dipakai'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>

                                            {isAdmin ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button style={styles.editBtn} onClick={() => openEditModal(room)}>Edit</button>
                                                    <button style={styles.deleteBtn} onClick={() => handleDelete(room.id)}>Hapus</button>
                                                </div>
                                            ) : (
                                                <button
                                                    style={room.isAvailable ? styles.bookBtn : styles.disabledBtn}
                                                    disabled={!room.isAvailable}
                                                    onClick={() => openBookingModal(room)}
                                                >
                                                    {room.isAvailable ? 'Pinjam Sekarang' : 'Sudah Terisi'}
                                                </button>
                                            )}

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {rooms.length === 0 && (
                            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                                Database kosong. Silakan tambahkan data ruangan.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}

            {/* 1. Modal CRUD (Admin) */}
            <RoomModal
                isOpen={isRoomModalOpen}
                onClose={() => setIsRoomModalOpen(false)}
                onSuccess={fetchRooms}
                roomToEdit={selectedRoomForEdit}
            />

            {/* 2. Modal Booking (Mahasiswa) */}
            {roomToBook && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    roomName={roomToBook.name}
                    roomId={roomToBook.id}
                    onSuccess={fetchRooms}
                />
            )}

        </div>
    );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: { minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: 'sans-serif' },
    navbarAdmin: { backgroundColor: '#1a202c', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center' },
    navbarUser: { backgroundColor: '#3182ce', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'center' },
    navBrand: { fontSize: '18px', fontWeight: 'bold' },
    navUser: { display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px' },
    logoutBtn: { padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '4px', cursor: 'pointer' },
    content: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '26px', color: '#2d3748', margin: 0, fontWeight: 'bold' },
    subtitle: { color: '#718096', marginTop: '5px' },
    addBtn: { padding: '12px 24px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    editBtn: { padding: '6px 12px', backgroundColor: '#ecc94b', color: '#744210', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    deleteBtn: { padding: '6px 12px', backgroundColor: '#f56565', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    bookBtn: { padding: '8px 16px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
    disabledBtn: { padding: '8px 16px', backgroundColor: '#cbd5e0', color: '#718096', border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontSize: '13px' },
    tableContainer: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f7fafc', padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', borderBottom: '1px solid #e2e8f0' },
    tr: { borderBottom: '1px solid #edf2f7' },
    td: { padding: '16px', fontSize: '14px', color: '#2d3748' },
    badgeAvailable: { backgroundColor: '#c6f6d5', color: '#22543d', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
    badgeBusy: { backgroundColor: '#fed7d7', color: '#822727', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
};

export default DashboardPage;