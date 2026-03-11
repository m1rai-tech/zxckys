const express = require('express');
const sequelize = require('./config/database');
const User = require('./models/User');


const app = express();
const port = process.env.PORT || 3111;


// Middleware
app.use(express.json());


// Initialize database
async function initDatabase() {
 try {
   await sequelize.authenticate();
   console.log('✓ Database connected');
   await sequelize.sync();
   console.log('✓ Database synchronized');
 } catch (error) {
   console.error('✗ Database error:', error.message);
   process.exit(1);
 }
}


// Routes
app.get('/', (req, res) => {
 res.json({ message: 'API is running', version: '1.0' });
});


app.get('/users', async (req, res) => {
 try {
   const users = await User.findAll();
   res.json({ success: true, data: users });
 } catch (error) {
   res.status(500).json({ success: false, error: error.message });
 }
});


app.get('/users/:id', async (req, res) => {
 try {
   const user = await User.findByPk(req.params.id);
   if (!user) {
     return res.status(404).json({ success: false, error: 'User not found' });
}
   res.json({ success: true, data: user });
 } catch (error) {
   res.status(500).json({ success: false, error: error.message });
 }
});


app.post('/users', async (req, res) => {
 try {
   const user = await User.create(req.body);
   res.status(201).json({ success: true, data: user });
 } catch (error) {
   res.status(400).json({ success: false, error: error.message });
 }
});


// Start server
initDatabase().then(() => {
 app.listen(port, () => {
   console.log(`✓ Server running on http://localhost:${port}`);
 });
});
