import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database'; 

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyDBScLoaaUjJ4hbpuREX9kA0BdyPtNtREg",
  authDomain: "graph-2cfc7.firebaseapp.com",
  databaseURL: "https://graph-2cfc7-default-rtdb.firebaseio.com",
  projectId: "graph-2cfc7",
  storageBucket: "graph-2cfc7.appspot.com",
  messagingSenderId: "279318125379",
  appId: "1:279318125379:web:a3300442391bf1a781adf6",
  measurementId: "G-XBKMHNDYB6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const writeDataToFirebase = async () => {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('GitHub个人访问令牌未配置');
    return;
  }

  const query = `
    query($userName: String!) {
      user(login: $userName) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    userName: 'Vinskao', 
  };

  const headers = {
    'Authorization': `Bearer ${githubToken}`,
    'Content-Type': 'application/json',
  };
////////////////
  const firebaseDatabaseURL = 'https://YOUR_PROJECT_ID.firebaseio.com/YOUR_PATH.json'; // Replace with your Firebase Realtime Database URL

  try {
    const response = await fetch(firebaseDatabaseURL, {
      method: 'PUT',
      body: JSON.stringify({ query, variables }),
      headers,
    });

    if (response.ok) {
      const firebaseDatabaseRef = ref(db, '/'); 
      await set(firebaseDatabaseRef, { query, variables });
      console.log('GitHub数据已写入 Firebase 实时数据库');
    } else {
      console.error('写入数据库时发生错误:', response.statusText);
    }
  } catch (error) {
    console.error('写入数据库时发生错误:', error);
  }
};

writeDataToFirebase();