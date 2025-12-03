const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  process.exit(1);
}

async function updateUsernames() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // تحديث usernames للموظفين الموجودين
    const updates = [
      { email: 'saher@company.com', username: 'saher' },
      { email: 'amira@company.com', username: 'amira' },
      { email: 'tasneem@company.com', username: 'tasneem' },
      { email: 'shaker@company.com', username: 'shaker' },
      { email: 'akram@company.com', username: 'Akram' }
    ];

    for (const update of updates) {
      const result = await client.query(
        'UPDATE users SET username = $1 WHERE email = $2 AND username IS NULL',
        [update.username, update.email]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ Updated username for ${update.email} → ${update.username}`);
      } else {
        console.log(`ℹ️  No update needed for ${update.email}`);
      }
    }

    console.log('\n✅ All usernames updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Connection closed');
  }
}

updateUsernames();
