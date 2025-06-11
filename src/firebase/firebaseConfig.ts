import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyC2J_XE5brFPmhLXFKY4uBabq6AYNSBerU',
  authDomain: 'dscvr-app.firebaseapp.com',
  projectId: 'dscvr-app',
  storageBucket: 'dscvr-app.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);

export { app };
