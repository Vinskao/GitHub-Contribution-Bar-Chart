import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

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
  .then(response => {
    const result = response.data.data;
    const formattedResult = JSON.stringify(result, null, 2);
    console.log(formattedResult);
    fs.writeFileSync('github-query-result.json', formattedResult);

  })
  .catch(error => {
    console.error('GraphQL请求失败:', error);
  });
