import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';

dotenv.config();

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.error('GitHub个人访问令牌未配置，请检查.env文件。');
  process.exit(1);
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
}`;

const variables = {
  userName: 'Vinskao',
};

const headers = {
  'Authorization': `Bearer ${githubToken}`,
  'Content-Type': 'application/json',
};

axios.post('https://api.github.com/graphql', {
  query,
  variables,
}, {
  headers,
})
  .then(response => {
    const result = response.data.data;
    const formattedResult = JSON.stringify(result, null, 2);
    fs.writeFileSync('github-query-result.json', formattedResult);

    // Firebase初始化配置
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    function writeUserData(userId, name, email, data) {
      set(ref(db, 'users/' + userId), {
        username: name,
        email: email,
        data: data,
      });
    }

    writeUserData('user', 'Sorane', 'Sorane.com', formattedResult);

    const storage = getStorage(app);
    const storageReference = storageRef(storage, 'graph.json');

    // 将 formattedResult 写入 Storage 中
    uploadString(storageReference, formattedResult, 'raw').then((snapshot) => {
      console.log('Data uploaded to Firebase Storage.');
      // 获取上传后的文件的下载 URL（如果需要）
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        console.log('Download URL:', downloadURL);
      }).catch((error) => {
        console.error('Error getting download URL:', error);
      });
    }).catch((error) => {
      console.error('Error uploading data to Firebase Storage:', error);
    });
  })
  .catch(error => {
    console.error('GraphQL请求失败:', error);
  });
