const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'study_app'
});

console.log('データベースから画像を含む語句を確認中...');

connection.execute(
  'SELECT id, term, CHAR_LENGTH(meaning) as meaning_length, CHAR_LENGTH(example) as example_length, SUBSTRING(meaning, 1, 50) as meaning_start, SUBSTRING(example, 1, 50) as example_start FROM terms WHERE meaning LIKE "%data:image%" OR example LIKE "%data:image%" LIMIT 5',
  (err, results) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('画像を含む語句:');
      results.forEach((row, index) => {
        console.log(`\n--- 語句 ${index + 1} ---`);
        console.log('ID:', row.id);
        console.log('Term:', row.term);
        console.log('Meaning length:', row.meaning_length, 'characters');
        console.log('Example length:', row.example_length, 'characters');
        console.log('Meaning start:', row.meaning_start);
        console.log('Example start:', row.example_start);
        
        // data:imageの位置を確認
        if (row.meaning_start && row.meaning_start.includes('data:image')) {
          console.log('★ Meaningにdata:imageが含まれています');
        }
        if (row.example_start && row.example_start.includes('data:image')) {
          console.log('★ Exampleにdata:imageが含まれています');
        }
      });
    }
    connection.end();
  }
);
