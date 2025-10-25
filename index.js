import dotenv from 'dotenv';
import { DB } from './connect.js'
import express from 'express'
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.configDotenv()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET; // Store in .env in production!
const app = express();
const port = process.env.PORT

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json())

// Serve static files from Quasar build
app.use(express.static(path.join(__dirname, 'quasar', 'dist', 'spa')));

// JWT Middleware - verifies token on protected routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user; // Add user data to request
        next();
    });
}

// API Routes (these come before the catch-all route)
app.get('/api', (req, res) => {
    //get all users from table
    res.set('content-type', 'application/json');
    const sql = 'SELECT * FROM users'
    let data = {
        users: []
    }
    try {
    // DB.get() returns signle row
    DB.all(sql, [], (err, rows) => {
            if(err) {
                throw err; // lets catch handle error...
            }
            rows.forEach((row) => {
                data.users.push({
                    id: row.user_id,
                    name: row.user_name,
                    email: row.user_email,
                    phone: row.user_phone,
                    password: row.user_pw
                })
            })
            let content = JSON.stringify(data)
            res.send(content)
    })
    } catch (err) {
        if(err) {
            console.log(err.message)
            res.status(467)
            res.send(err.message)
            return;
        }
    }
})

// Register endpoint
app.post('/api/register', (req, res) => {
    res.set('content-type', 'application/json');
    
    const { name, email, phone, password } = req.body;
    
    // Check if required fields exist
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields: name, email, password" });
    }
    
    // Check if user already exists
    DB.get('SELECT * FROM users WHERE user_email = ?', [email], (err, row) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({ error: err.message });
        }
        
        if (row) {
            return res.status(400).json({ error: "Email already registered" });
        }
        
        // Hash password and create user
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        const sql = 'INSERT INTO users(user_name, user_email, user_phone, user_pw) VALUES(?, ?, ?, ?)';
        
        try {
            DB.run(sql, [name, email, phone || null, hash], function (err) {
                if(err) {
                    console.log(err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                const userId = this.lastID;
                
                // Generate JWT token
                const token = jwt.sign(
                    { userId: userId, email: email, name: name },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                res.status(201).json({ 
                    message: `User registered successfully`,
                    token: token,
                    user: {
                        id: userId,
                        name: name,
                        email: email,
                        phone: phone
                    }
                });
            });
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ error: err.message });
        }
    });
})

// Login endpoint
app.post('/api/login', (req, res) => {
    res.set('content-type', 'application/json');
    
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email && !password) {
        return res.status(400).json({ error: "Please enter an email and password to get started." });
    }

    if(!email) {
        return res.status(400).json({error:"Please enter en email address."})
    }
    if(!password) {
        return res.status(400).json({error:"Please enter a password"})
    }
    
    const sql = 'SELECT * FROM users WHERE user_email = ?';
    
    try {
        DB.get(sql, [email], (err, row) => {
            if (err) {
                console.log(err.message);
                return res.status(500).json({ error: err.message });
            }
            
            // User not found
            if (!row) {
                return res.status(401).json({ 
                    error: "Invalid email or password" 
                });
            }
            
            // Compare password with hash
            bcrypt.compare(password, row.user_pw, (err, result) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                if (result) {
                    // Password matches - generate JWT token
                    const token = jwt.sign(
                        { userId: row.user_id, email: row.user_email, name: row.user_name },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );
                    
                    res.status(200).json({ 
                        message: "Login successful",
                        token: token,
                        user: {
                            id: row.user_id,
                            name: row.user_name,
                            email: row.user_email,
                            phone: row.user_phone
                        }
                    });
                } else {
                    // Password doesn't match
                    res.status(401).json({ 
                        error: "Invalid email or password" 
                    });
                }
            });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api', (req, res) => {
     console.log(req.body)
     res.set('content-type', 'application/json');
     const sql = 'DELETE FROM users WHERE user_id=?'

      try {
        DB.run(sql, [req.query.id], function (err) {
            if(err) throw err;
            if(this.changes === 1) {
                //one item deleted
                  res.status(200)
                  res.send(`user ${req.query.id} removed.`)
            } else {
                //no delete done
                res.status(200)
                res.send('No users to delete')
            }
        })
    
    } catch (err) {
        if(err) {
            console.log(err.message)
            res.status(468)
            res.send(err.message)
            return;
        }
    }
})

// Create new task for a user (protected route)
app.post('/api/tasks', authenticateToken, (req, res) => {
    res.set('content-type', 'application/json');
    
    const { title, description, dueDate, complete, priority } = req.body;
    
    // Check if required fields exist
    if (!title) {
        return res.status(400).json({ error: "Missing required field: title" });
    }
    
    const sql = 'INSERT INTO tasks(user_id, title, description, dueDate, complete, priority) VALUES(?, ?, ?, ?, ?, ?)';
    const completeValue = complete ? 1 : 0;
    
    try {
        DB.run(sql, [
            req.user.userId, // Get userId from JWT token
            title,
            description || '',
            dueDate || '',
            completeValue,
            priority
        ], function (err) {
            if(err) {
                console.log(err.message);
                return res.status(500).json({ error: err.message });
            }
            
            let newTaskId = this.lastID;
            res.status(201).json({ 
                message: `Task created successfully`,
                taskId: newTaskId
            });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get all tasks for logged in user (protected route)
app.get('/api/tasks', authenticateToken, (req, res) => {
    res.set('content-type', 'application/json');
    
    const sql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY task_id DESC';
    
    try {
        DB.all(sql, [req.user.userId], (err, rows) => {
            if(err) {
                console.log(err.message);
                return res.status(500).json({ error: err.message });
            }
            
            let tasks = rows.map(row => ({
                id: row.task_id,
                userId: row.user_id,
                title: row.title,
                description: row.description,
                dueDate: row.dueDate,
                complete: row.complete === 1,
                priority: row.priority
            }));
            
            res.status(200).json({ tasks });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get single task by ID (protected route)
app.get('/api/tasks/:id', authenticateToken, (req, res) => {
    res.set('content-type', 'application/json');
    
    const taskId = req.params.id;
    const sql = 'SELECT * FROM tasks WHERE task_id = ? AND user_id = ?';
    
    try {
        DB.get(sql, [taskId, req.user.userId], (err, row) => {
            if(err) {
                console.log(err.message);
                return res.status(500).json({ error: err.message });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            const task = {
                id: row.task_id,
                userId: row.user_id,
                title: row.title,
                description: row.description,
                dueDate: row.dueDate,
                complete: row.complete === 1
            };
            
            res.status(200).json({ task });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Update task (toggle complete, etc.) - protected route
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    res.set('content-type', 'application/json');
    
    const taskId = req.params.id;
    const { title, description, dueDate, complete } = req.body;
    
    // First, verify the task belongs to the user
    const checkSql = 'SELECT * FROM tasks WHERE task_id = ? AND user_id = ?';
    
    try {
        DB.get(checkSql, [taskId, req.user.userId], (err, row) => {
            if (err) {
                console.log(err.message);
                return res.status(500).json({ error: err.message });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Task not found or unauthorized' });
            }
            
            // Update the task
            const updateSql = `UPDATE tasks 
                               SET title = ?, description = ?, dueDate = ?, complete = ? 
                               WHERE task_id = ?`;
            
            const completeValue = complete ? 1 : 0;
            
            DB.run(updateSql, [
                title || row.title,
                description !== undefined ? description : row.description,
                dueDate !== undefined ? dueDate : row.dueDate,
                completeValue,
                taskId
            ], function(err) {
                if (err) {
                    console.log(err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                res.status(200).json({ 
                    message: 'Task updated successfully'
                });
            });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Delete task - protected route
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    res.set('content-type', 'application/json');
    
    const taskId = req.params.id;
    
    // First, verify the task belongs to the user
    const checkSql = 'SELECT * FROM tasks WHERE task_id = ? AND user_id = ?';
    
    try {
        DB.get(checkSql, [taskId, req.user.userId], (err, row) => {
            if (err) {
                console.log(err.message);
                return res.status(500).json({ error: err.message });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Task not found or unauthorized' });
            }
            
            // Delete the task
            const deleteSql = 'DELETE FROM tasks WHERE task_id = ?';
            
            DB.run(deleteSql, [taskId], function(err) {
                if (err) {
                    console.log(err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                res.status(200).json({ 
                    message: 'Task deleted successfully'
                });
            });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Change password - protected route
app.put('/api/user/password', authenticateToken, (req, res) => {
    res.set('content-type', 'application/json');
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    // Get user's current password hash
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    
    try {
        DB.get(sql, [req.user.userId], (err, row) => {
            if (err) {
                console.log(err.message);
                return res.status(500).json({ error: err.message });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Verify current password
            bcrypt.compare(currentPassword, row.user_pw, (err, result) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                if (!result) {
                    return res.status(401).json({ error: 'Current password is incorrect' });
                }
                
                // Hash new password
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(newPassword, salt);
                
                // Update password
                const updateSql = 'UPDATE users SET user_pw = ? WHERE user_id = ?';
                
                DB.run(updateSql, [hash, req.user.userId], function(err) {
                    if (err) {
                        console.log(err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    res.status(200).json({ 
                        message: 'Password changed successfully'
                    });
                });
            });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Delete account - protected route
app.delete('/api/user/account', authenticateToken, (req, res) => {
    res.set('content-type', 'application/json');
    
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: 'Password is required to delete account' });
    }
    
    // Get user to verify password
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    
    try {
        DB.get(sql, [req.user.userId], (err, row) => {
            if (err) {
                console.log(err.message);
                return res.status(500).json({ error: err.message });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Verify password
            bcrypt.compare(password, row.user_pw, (err, result) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                if (!result) {
                    return res.status(401).json({ error: 'Password is incorrect' });
                }
                
                // Delete user's tasks first (foreign key constraint)
                const deleteTasksSql = 'DELETE FROM tasks WHERE user_id = ?';
                
                DB.run(deleteTasksSql, [req.user.userId], function(err) {
                    if (err) {
                        console.log(err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    // Now delete the user
                    const deleteUserSql = 'DELETE FROM users WHERE user_id = ?';
                    
                    DB.run(deleteUserSql, [req.user.userId], function(err) {
                        if (err) {
                            console.log(err.message);
                            return res.status(500).json({ error: err.message });
                        }
                        
                        res.status(200).json({ 
                            message: 'Account deleted successfully'
                        });
                    });
                });
            });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Serve Quasar app for root route (hash mode handles all client-side routing)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'quasar', 'dist', 'spa', 'index.html'));
});

app.listen(port, (err) => {
    if(err) {
        console.log('ERROR: ',err.message)
        return;
    }
    console.log(`server running on port ${port}`)
})