export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Signup: undefined;
  
  // Main tabs
  Home: undefined;
  Explore: undefined;
  Create: undefined;
  Messages: undefined;
  Profile: undefined;
  
  // Home stack screens
  HomeFeed: undefined;
  
  // Explore stack screens
  ExploreMain: undefined;
  Search: undefined;
  SearchResults: { query: string; category?: string };
  LocationList: { title: string; description: string };
  CollectionDetail: { collectionId: string };
  Disco: undefined;
  Events: undefined;
  EventDetail: { eventId: string; eventData?: any };
  EventReservation: { 
    eventId: string; 
    ticketType: any; 
    quantity: number; 
    totalPrice: number;
  };
  TicketConfirmation: {
    eventId: string;
    ticketType: any;
    quantity: number;
    totalPrice: number;
    confirmationNumber: string;
  };
  PlanMyNight: undefined;
  NearbyPlacesScreen: undefined;
  PlaceDetail: { placeId: string };
  AllReviews: { placeId: string };
  WriteReview: { placeId: string };
  Reservation: { placeId: string };
  VideoRecord: undefined;
  
  // Create stack screens
  CreateMain: undefined;
  
  // Messages stack screens
  MessagesMain: undefined;
  MessageChat: { chatId: string };
  NewMessage: undefined;
  CreateGroup: undefined;
  ChatSettings: { chatId: string };
  ReportUser: { userId: string };
  
  // Profile stack screens
  ProfileMain: undefined;
  EditProfile: undefined;
};
