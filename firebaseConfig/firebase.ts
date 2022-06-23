import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
	apiKey: 'AIzaSyDyxdkVNfCQyGf_P9_YUXZLT74QHHahhCU',
	authDomain: 'remox-dao.firebaseapp.com',
	projectId: 'remox-dao',
	storageBucket: 'remox-dao.appspot.com',
	messagingSenderId: '206826931700',
	appId: '1:206826931700:web:e2f9e6bd053772b80ba5a1',
	measurementId: 'G-7BMKHB905F'
};

export const app = initializeApp(firebaseConfig, "client");
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// export const analytics = getAnalytics(app);
