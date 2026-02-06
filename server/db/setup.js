const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const dbName = process.env.DB_NAME || 'open-kai';
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default database first
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      // Create the database if it doesn't exist
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }

    await client.end();

    // Connect to the database and run the init script
    const newClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: dbName
    });

    await newClient.connect();
    console.log('Connected to database');

    // Read and execute the init-simple.sql file
    const initSql = fs.readFileSync(path.join(__dirname, 'init-simple.sql'), 'utf8');
    const terminalSql = fs.readFileSync(path.join(__dirname, 'terminal-migration.sql'), 'utf8');
    
    // Execute the SQL
    await newClient.query(initSql);
    await newClient.query(terminalSql);

    console.log('Database tables created/updated successfully');

    await newClient.end();
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
