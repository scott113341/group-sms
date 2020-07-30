const { Client } = require("pg");

async function withPgClient(callback) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();

  try {
    const result = await callback(client);
    await client.end();
    return result;
  } catch (e) {
    await client.end();
    throw e;
  }
}

module.exports = withPgClient;
