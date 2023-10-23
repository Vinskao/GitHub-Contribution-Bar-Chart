import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database'; // 引入 Firebase 实时数据库模块

dotenv.config();

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);

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
    userName: 'Vinskao', // 你的 GitHub 用户名
  };

  const headers = {
    'Authorization': `Bearer ${githubToken}`,
    'Content-Type': 'application/json',
  };

  // 获取 Firebase 实时数据库的引用
  const db = getDatabase(app);
  const firebaseDatabaseRef = ref(db, 'https://graph-2cfc7-default-rtdb.firebaseio.com/'); // 请替换为你的数据库路径

  try {
    const response = await fetch(firebaseDatabaseURL, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
      headers,
    });

    if (response.ok) {
      // 将数据写入 Firebase 实时数据库
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
