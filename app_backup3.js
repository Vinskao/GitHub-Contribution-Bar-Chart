import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import dotenv from 'dotenv';
///
import * as fs from 'fs';
import axios from 'axios';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { ref as databaseRef } from 'firebase/database'; // 重命名为 databaseRef
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

function writeUserDataWeb(userId, name, email, data) {
  set(databaseRef(db, 'users/' + userId), {
    username: name,
    email: email,
    data: data,
  });
}

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
}
`;

const variables = {
  userName: 'Vinskao',
};

const headers = {
  'Authorization': `Bearer ${githubToken}`,
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
    // console.log(formattedResult);
    fs.writeFileSync('github-query-result.json', formattedResult);

  })
  .catch(error => {
    console.error('GraphQL请求失败:', error);
  });
///////formattedResult to firebase
axios.post('https://api.github.com/graphql', {
  query,
  variables,
}, {
  headers,
})
  .then(response => {
    const result = response.data.data;
    const formattedResult = JSON.stringify(result, null, 2);
    console.log(formattedResult);
    fs.writeFileSync('github-query-result.json', formattedResult);

    writeUserData('githubData', 'Vinskao', 'xxx@xxx.com', formattedResult);
  })
  .catch(error => {
    console.error('GraphQL请求失败:', error);
  });

///

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function writeUserDataWeb(userId, name, email, data) {
  set(ref(db, 'users/' + userId), {
    username: name,
    email: email,
    data: data,
  });
}

writeUserDataWeb('user', 'Sorane', 'Sorane.com', 'null');
//////replace data in storage
// const admin = require('firebase-admin');

// const serviceAccount = require('./graph-2cfc7-f902d376180e.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://graph-2cfc7-default-rtdb.firebaseio.com',
// });

// function writeUserDataAdmin(userId, name, email, formattedResult) {
//   const db = admin.database();
//   const ref = db.ref('users/' + userId);

//   const userData = {
//     username: name,
//     email: email,
//     data: formattedResult,
//   };

//   ref.set(userData, (error) => {
//     if (error) {
//       console.error('Data could not be saved:', error);
//     } else {
//       console.log('Data saved successfully.');
//     }
//   });
// }
// writeUserDataAdmin('user', 'Sorane', 'Sorane.com', formattedResult);




const storage = getStorage(app);

const storageRef = ref(storage, 'graph.json');

// 将 formattedResult 写入 Storage 中
uploadString(storageRef, formattedResult, 'raw').then((snapshot) => {
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