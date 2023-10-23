import axios from '/node_modules/axios/dist/axios.js';
import dotenv from '/node_modules/dotenv/main.js';

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
`;

const variables = {
  userName: 'Vinskao',
  date: '2023-10-23',
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
  .then(async response => {
    const result = response.data.data;
    const formattedResult = JSON.stringify(result, null, 2);
    console.log(formattedResult);

    // 创建一个 Blob 对象
    const blob = new Blob([formattedResult], { type: 'application/json' });

    // 创建一个下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'github-query-result.json';

    // 模拟用户点击下载链接
    a.click();
  })
  .catch(error => {
    console.error('GraphQL请求失败:', error);
  });
