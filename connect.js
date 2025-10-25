import sqlite3 from 'sqlite3'
const sql3 = sqlite3.verbose();

// Use OPEN_READWRITE | OPEN_CREATE to create the file if it doesn't exist
const DB = new sql3.Database(
    './database.db', 
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
    connected
);

function connected(err) {
    if(err) {
        console.log('Database connection error:', err.message)
        return;
    }
    console.log('Connected to SQLite database')
    
    // Initialize database after connection
    initializeDatabase();
}

function initializeDatabase() {
    // Enable WAL mode for better performance
    DB.run('PRAGMA journal_mode = WAL;', (err) => {
        if(err) {
            console.log('WAL mode error:', err.message)
        } else {
            console.log('WAL mode enabled')
        }
    });

    // Create users table
    let usersSql = `CREATE TABLE IF NOT EXISTS users(
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL UNIQUE,
        user_phone INTEGER,
        user_pw TEXT NOT NULL
    )`;

    DB.run(usersSql, [], (err) => {
        if(err) {
            console.log('Users table error:', err.message)
            return;
        }
        console.log('Users table ready')
    });

    // Create tasks table
    let tasksSql = `CREATE TABLE IF NOT EXISTS tasks(
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT,
        complete INTEGER DEFAULT 0,
        priority TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )`;

    DB.run(tasksSql, [], (err) => {
        if(err) {
            console.log('Tasks table error:', err.message)
            return;
        }
        console.log('Tasks table ready')
    });
}

export { DB }