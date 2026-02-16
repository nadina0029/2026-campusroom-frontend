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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    // FUNGSI BARU: Toggle status ketersediaan manual oleh Admin
    const toggleRoomStatus = async (room: Room) => {
        try {
            const updatedStatus = !room.isAvailable;
            
            // Kirim update ke backend. Pastikan objek yang dikirim lengkap sesuai kebutuhan API PUT
            await api.put(`/Rooms/${room.id}`, {
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                facilities: room.facilities,
                isAvailable: updatedStatus
            });

            alert(`✅ Status ruangan ${room.name} berhasil diubah.`);
            fetchRooms(); // Refresh data
        } catch (error) {
            console.error("Gagal mengubah status:", error);
            alert("❌ Gagal memperbarui status ruangan di database.");
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

    // Logika Filter
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'available' ? room.isAvailable : !room.isAvailable;
        return matchesSearch && matchesStatus;
    });

    return (
        <div style={styles.pageContainer}>

            {/* --- NAVIGATION BAR --- */}
            <nav style={isAdmin ? styles.navbarAdmin : styles.navbarUser}>
                <div style={styles.navBrand}>
                    {isAdmin ? '🛡️ CAMPUS ADMIN' : '🏛️ CAMPUS BOOKING'}
                    <button
                        onClick={() => navigate('/history')}
                        style={styles.historyNavBtn}
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

                {/* --- FILTER BAR --- */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        placeholder="Cari ruangan..."
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
                        <option value="available">Tersedia</option>
                        <option value="busy">Tidak Tersedia</option>
                    </select>
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
                                {filteredRooms.map((room) => (
                                    <tr key={room.id} style={styles.tr}>
                                        <td style={styles.td}><b>{room.name}</b></td>
                                        <td style={styles.td}>{room.capacity} Org</td>
                                        <td style={{ ...styles.td, maxWidth: '300px', fontSize: '13px', color: '#555' }}>
                                            {room.facilities}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={room.isAvailable ? styles.badgeAvailable : styles.badgeBusy}>
                                                {room.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>

                                            {isAdmin ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {/* Tombol sakelar status khusus Admin */}
                                                    <button 
                                                        style={room.isAvailable ? styles.deactivateBtn : styles.activateBtn} 
                                                        onClick={() => toggleRoomStatus(room)}
                                                    >
                                                        {room.isAvailable ? 'Matikan' : 'Aktifkan'}
                                                    </button>
                                                    <button style={styles.editBtn} onClick={() => openEditModal(room)}>Edit</button>
                                                    <button style={styles.deleteBtn} onClick={() => handleDelete(room.id)}>Hapus</button>
                                                </div>
                                            ) : (
                                                <button
                                                    style={room.isAvailable ? styles.bookBtn : styles.disabledBtn}
                                                    disabled={!room.isAvailable}
                                                    onClick={() => openBookingModal(room)}
                                                >
                                                    {room.isAvailable ? 'Pinjam Sekarang' : 'Tidak Tersedia'}
                                                </button>
                                            )}

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredRooms.length === 0 && (
                            <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                                Ruangan tidak ditemukan.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- MODALS --- */}
            <RoomModal
                isOpen={isRoomModalOpen}
                onClose={() => setIsRoomModalOpen(false)}
                onSuccess={fetchRooms}
                roomToEdit={selectedRoomForEdit}
            />

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
    navBrand: { fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' },
    navUser: { display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px' },
    historyNavBtn: { backgroundColor: 'white', color: '#333', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    logoutBtn: { padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '4px', cursor: 'pointer' },
    content: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '26px', color: '#2d3748', margin: 0, fontWeight: 'bold' },
    subtitle: { color: '#718096', marginTop: '5px' },
    addBtn: { padding: '12px 24px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    editBtn: { padding: '6px 12px', backgroundColor: '#ecc94b', color: '#744210', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    deleteBtn: { padding: '6px 12px', backgroundColor: '#f56565', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    activateBtn: { padding: '6px 12px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    deactivateBtn: { padding: '6px 12px', backgroundColor: '#718096', color: '#white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    bookBtn: { padding: '8px 16px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
    disabledBtn: { padding: '8px 16px', backgroundColor: '#cbd5e0', color: '#718096', border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontSize: '13px' },
    tableContainer: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#f7fafc', padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#4a5568', borderBottom: '1px solid #e2e8f0' },
    tr: { borderBottom: '1px solid #edf2f7' },
    td: { padding: '16px', fontSize: '14px', color: '#2d3748' },
    badgeAvailable: { backgroundColor: '#c6f6d5', color: '#22543d', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
    badgeBusy: { backgroundColor: '#fed7d7', color: '#822727', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
    searchInput: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '300px', fontSize: '14px' },
    selectInput: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white' }
};

export default DashboardPage;