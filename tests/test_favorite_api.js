// お気に入りAPI テストスクリプト
const http = require('http');

function testFavoriteAPI(categoryId, isFavorite) {
  const data = JSON.stringify({ is_favorite: isFavorite });
  
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: `/api/categories/${categoryId}/favorite`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ レスポンス (${res.statusCode}):`, JSON.parse(responseData));
    });
  });

  req.on('error', (error) => {
    console.error('❌ リクエストエラー:', error);
  });

  req.write(data);
  req.end();
}

// テスト実行（カテゴリID 1をお気に入りにする）
console.log('🧪 お気に入りAPI テスト開始...');
testFavoriteAPI(1, true);

setTimeout(() => {
  console.log('🧪 お気に入り解除テスト...');
  testFavoriteAPI(1, false);
}, 2000);
