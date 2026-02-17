// Ini kontrak data: Backend janji bakal kirim token berbentuk string
export interface LoginResponse {
  token: string;
  expiration: string;
}

// Ini bentuk data User (opsional, buat persiapan aja)
export interface User {
  username: string;
  id?: number;
}
// Sesuaikan field ini dengan Kolom Database kamu!
export interface Room {
  id: number;
  name: string;
  capacity: number;
  facilities: string;   // Dulu description, sekarang facilities
  isAvailable: boolean; // 1 (true) atau 0 (false)
}
export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  startTime: string; // Format ISO dari DB
  endTime: string;   // Format ISO dari DB
  purpose: string;   // Kolom 'Purpose' di DB
  status: string;    // 'Approved', 'Pending', atau 'Rejected'
  roomName?: string; // (Opsional) Jika backend join dengan tabel Rooms
  userName?: string;

  room?: {
    id?: number;
    name?: string;
  };
  
  user?: {
    id?: number;
    username?: string;
  };
}