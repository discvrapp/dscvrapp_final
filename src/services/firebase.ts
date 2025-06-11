import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { app } from '../firebase/firebaseConfig';

// Initialize Firestore
export const db = getFirestore(app);

// Review functions
export const addReview = async (review: {
  placeId: string;
  placeName: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  images?: string[];
  video?: string;
  amenities?: any[];
  reviewType: string;
  createdAt: string;
}) => {
  try {
    console.log("Firebase addReview called with:", review);
    const docRef = await addDoc(collection(db, "reviews"), {
      placeId: review.placeId,
      placeName: review.placeName,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      text: review.text,
      images: review.images || [],


      amenities: review.amenities || [],
      reviewType: review.reviewType,
      ...(review.video && { video: review.video }),      createdAt: Timestamp.now(),
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding review:", error);
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
