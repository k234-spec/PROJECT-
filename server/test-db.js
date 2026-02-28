const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/portfolio');
  const db = mongoose.connection.db;
  console.log('\n==================================================');
  console.log(' DATABASE VERIFICATION REPORT');
  console.log('==================================================\n');
  const users = await db.collection('users').find({}).project({ password: 0 }).toArray();
  console.log('--- USERS IN DB ---');
  console.log(JSON.stringify(users, null, 2));
  const projects = await db.collection('projects').find({}).toArray();
  console.log('\n--- PROJECTS IN DB ---');
  console.log(JSON.stringify(projects, null, 2));
  console.log('\n==================================================\n');
  process.exit(0);
}
run();
