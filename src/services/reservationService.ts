// Mock reservation service for MVP
// In production, replace with real API (OpenTable, Resy, etc.)

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: string;
  time: string;
  partySize: number;
  userName: string;
  userPhone: string;
  userEmail: string;
  specialRequests?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
}

// Mock available time slots
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = [
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', 
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', 
    '9:00 PM', '9:30 PM', '10:00 PM'
  ];
  
  times.forEach(time => {
    // Randomly make some slots unavailable
    slots.push({
      time,
      available: Math.random() > 0.3
    });
  });
  
  return slots;
};

export const getAvailableSlots = async (
  restaurantId: string, 
  date: string, 
  partySize: number
): Promise<TimeSlot[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In production, call real API
  // const response = await fetch(`/api/availability?restaurant=${restaurantId}&date=${date}&party=${partySize}`);
  
  return generateTimeSlots();
};

export const createReservation = async (
  reservation: Omit<Reservation, 'id' | 'createdAt'>
): Promise<Reservation> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newReservation: Reservation = {
    ...reservation,
    id: `RES-${Date.now()}`,
    createdAt: new Date(),
  };
  
  // In production, save to backend
  // const response = await fetch('/api/reservations', { method: 'POST', body: JSON.stringify(reservation) });
  
  // For MVP, save to AsyncStorage
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const existing = await AsyncStorage.getItem('reservations');
    const reservations = existing ? JSON.parse(existing) : [];
    reservations.push(newReservation);
    await AsyncStorage.setItem('reservations', JSON.stringify(reservations));
  } catch (error) {
    console.error('Error saving reservation:', error);
  }
  
  return newReservation;
};

export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const existing = await AsyncStorage.getItem('reservations');
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
};

export const cancelReservation = async (reservationId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const existing = await AsyncStorage.getItem('reservations');
    if (existing) {
      const reservations = JSON.parse(existing);
      const index = reservations.findIndex((r: Reservation) => r.id === reservationId);
      if (index !== -1) {
        reservations[index].status = 'cancelled';
        await AsyncStorage.setItem('reservations', JSON.stringify(reservations));
        return true;
      }
    }
  } catch (error) {
    console.error('Error cancelling reservation:', error);
  }
  
  return false;
};
