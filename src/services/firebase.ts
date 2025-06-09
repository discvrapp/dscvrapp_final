import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBpYiFc_AU9078oITdrLUZJVzar6fodiNE",
  authDomain: "dscvr-app.firebaseapp.com",
  projectId: "dscvr-app",
  storageBucket: "dscvr-app.firebasestorage.app",
  messagingSenderId: "501064753061",
  appId: "1:501064753061:web:cf42a5fbd318bad411124c",
  measurementId: "G-9M5Y3XCELB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Review functions
export const addReview = async (review: {
  placeId: string;
  placeName: string;
  userName: string;
  rating: number;
  text: string;
  userId?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getReviewsByPlaceId = async (placeId: string) => {
  try {
    const q = query(
      collection(db, 'reviews'), 
      where('placeId', '==', placeId)
    );
    
    const querySnapshot = await getDocs(q);
    const reviews: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt
      });
    });
    
    // Sort by createdAt manually
    reviews.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};
