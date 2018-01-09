const { Client } = require('pg');


async function withPgClient (callback) {
  const client = new Client(process.env.DATABASE_URL);
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
