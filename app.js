import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
import cron from 'node-cron';

dotenv.config();

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.error('GitHub个人访问令牌未配置，请检查.env文件。');
  process.exit(1);
}

const query = `
query($userName: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $userName) {
    contributionsCollection(from: $from, to: $to) {
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

const fetchContributionsByYear = async (year) => {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const variables = {
    userName: 'Vinskao',
    from,
    to,
  };

  const headers = {
    Authorization: `Bearer ${githubToken}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      { query, variables },
      { headers }
    );
    return { year, data: response.data.data.user.contributionsCollection.contributionCalendar };
  } catch (error) {
    // console.error(`GraphQL请求失败 (Year: ${year}):`, error);
    return null;
  }
};

const fetchContributions = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = currentYear - 4; // 查询最近5年，包括当前年份

  const contributions = [];

  for (let year = startYear; year <= currentYear; year++) {
    const result = await fetchContributionsByYear(year);
    if (result) contributions.push(result);
  }

  // 将所有数据合并并保存到本地文件
  const formattedResult = JSON.stringify(contributions, null, 2);
  fs.writeFileSync('github-query-result.json', formattedResult);

  console.log('所有年份的贡献数据已保存到 github-query-result.json');

  // Firebase初始化配置
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  // 按年份写入 Firebase Database
  for (const { year, data } of contributions) {
    const dbRef = ref(db, `users/Vinskao/contributions/${year}`);
    await set(dbRef, data);
    // console.log(`数据已写入 Firebase Database: ${year}`);
  }

  // 将完整的合并数据上传到 Firebase Storage
  const storage = getStorage(app);
  const storageReference = storageRef(storage, 'graph.json');

  await uploadString(storageReference, formattedResult, 'raw');
  console.log('完整数据已上传到 Firebase Storage.');

  const downloadURL = await getDownloadURL(storageReference);
  console.log('下载链接:', downloadURL);
};

// 使用 cron 每日运行一次
cron.schedule('0 0 * * *', fetchContributions); // 每日凌晨运行
fetchContributions();
