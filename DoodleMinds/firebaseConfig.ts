// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsdKxw9WzmoD1ebH33Yhh0hPNQ_yjlE7k",
  authDomain: "doodlemindsgame.firebaseapp.com",
  databaseURL: "https://doodlemindsgame-default-rtdb.firebaseio.com",
  projectId: "doodlemindsgame",
  storageBucket: "doodlemindsgame.appspot.com",
  messagingSenderId: "223462667159",
  appId: "1:223462667159:web:8b35468f828f3bfc34cad2",
  measurementId: "G-R8PQ27EH0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const database = getDatabase(app);