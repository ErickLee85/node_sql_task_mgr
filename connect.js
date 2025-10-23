import sqlite3 from 'sqlite3'
const sql3 = sqlite3.verbose();

// const DB = new sql3.Database(':memory:', sqlite3.OPEN_READWRITE, connected); temporary db created in memory
// const DB = new sql3.Database('', sqlite3.OPEN_READWRITE, connected); anonymous file in file system
const DB = new sql3.Database('./database.db', sqlite3.OPEN_READWRITE, connected);

function connected(err) {
    if(err) {
        console.log(err.message)
        return;
    }
    console.log('Created the DB or SQLITE DB already exists...')
}

// Enable WAL mode for better performance
DB.run('PRAGMA journal_mode = WAL;', (err) => {
    if(err) {
        console.log('WAL mode error:', err.message)
    } else {
        console.log('WAL mode enabled')
    }
});

let sql = `CREATE TABLE IF NOT EXISTS users(
            user_id INTEGER PRIMARY KEY,
            user_name TEXT NOT NULL,
            user_email TEXT NOT NULL,
            user_phone INTEGER,
            user_pw TEXT NOT NULL
        )`;

DB.run(sql, [], (err) => {
    if(err) {
        console.log(err.message)
        return;
    }
    console.log('CREATED TABLE')
})


// Create tasks table
let tasksSql = `CREATE TABLE IF NOT EXISTS tasks(
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    dueDate TEXT,
    complete INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)`;

DB.run(tasksSql, [], (err) => {
    if(err) {
        console.log(err.message)
        return;
    }
    console.log('CREATED TASKS TABLE')
})

export { DB }