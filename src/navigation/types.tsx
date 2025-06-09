export type RootStackParamList = {
  Main: undefined;
  PlaceDetail: { placeId: string };
  AllReviews: { placeId: string };
  WriteReview: { placeId: string; placeName: string };
  VideoRecord: undefined;  Search: undefined;
  Disco: undefined;
  Events: undefined;
  Reservation: { placeId: string; placeName: string };
  PlanMyNight: undefined;
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Create: undefined;
  Messages: undefined;
  Profile: undefined;
};
