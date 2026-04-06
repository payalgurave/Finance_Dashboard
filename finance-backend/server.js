const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Override if Amazon Q plugin injected wrong value
if (!process.env.MONGO_URI || !process.env.MONGO_URI.startsWith('mongodb')) {
  process.env.MONGO_URI = 'mongodb://mongo:vxgrNwXKuuPMJwZyTkzRtxYFDWmWrgEm@interchange.proxy.rlwy.net:23742/finance_db?authSource=admin';
}

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });
