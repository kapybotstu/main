import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA0zN84SxP4pXd-lf8lguw699Q_qYOrlU4",
  authDomain: "jobby-c3197.firebaseapp.com",
  databaseURL: "https://jobby-c3197-default-rtdb.firebaseio.com",
  projectId: "jobby-c3197",
  storageBucket: "jobby-c3197.firebasestorage.app",
  messagingSenderId: "327717152915",
  appId: "1:327717152915:web:0a5457734d2560dcb9c566"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;