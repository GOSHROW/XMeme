const { Pool, Client } = require('pg')

/*  Retaining default user fields, no dotenv / secrets
    Client connection pool limits provided hence
    pool.end() invoked in 1s
*/
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'memeDB',
  password: null,
  port: 5432,
  max: 50,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 2000,
});

// Pseudo-defualt connection string uses the previous params
const connectionString = "postgresql://localhost:5432/memeDB"

/*  SQL Schema has
    a serially incrementing ID acting as a Primary Key
    username provided by the client
    caption provided by the client
    imageURL verified and provided by the client
    like -> an int which increments with every empty PATCH request
    modified -> a timestamp to get track of latest entries
    Added trigger update_modified for updating modified to latest tuple patch
    Added contraint to identify unique POST requests pre-transaction
*/

function initTable() {
    pool.query(
        `CREATE TABLE IF NOT EXISTS memeEntries( 
            id SERIAL PRIMARY KEY, 
            username VARCHAR(100) NOT NULL, 
            caption VARCHAR(100) NOT NULL, 
            imageURL VARCHAR(2048) NOT NULL, 
            likes INTEGER DEFAULT 0,
            modified TIMESTAMP DEFAULT NOW());
        
        CREATE FUNCTION update_modified() RETURNS trigger
            LANGUAGE plpgsql
            AS $$
        BEGIN
            NEW.modified = NOW();
            RETURN NEW;
        END;
        $$;

        CREATE TRIGGER meme_modified_updated BEFORE UPDATE ON memeEntries
        FOR EACH ROW EXECUTE PROCEDURE 
        update_modified();
        
        ALTER TABLE memeEntries
        ADD CONSTRAINT uniqueMemeParams UNIQUE(caption, imageURL);`, 
        (err, res) => {
            console.log(err, res);
        }
    );
}

// initTable(); // Only needed for initial call, handled by server.js

/*  POST @ /memes
    excpects validated data
    TODO: validate all params
    returns a key-value pair (dict) JSON for successfully posted meme
*/

async function insertMeme(username, caption, imageURL) {
    const client = new Client(connectionString);
    try {
        await client.connect();

        let result = await client.query(
            `INSERT INTO memeEntries (username, caption, imageURL) 
            VALUES ('${username}', '${caption}', '${imageURL}') 
            RETURNING ID;`);
        return (result.rows[0]);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// insertMeme('name', 'caption', 'validURL').then(now => console.log(now));


/*  GET @ /memes/<id>
    excpects valid id
    returns all information for the id (entire row)
*/

async function getMeme(id) {
    const client = new Client(connectionString);
    try {
        await client.connect();

        let result = await client.query(
            `SELECT * FROM memeEntries WHERE id = ${id}`);
        return (result.rows[0]);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// getMeme('1').then(now => console.log(now));


/*  GET @ /memes/
    excpects null
    returns all information for latest 100 POST requests (entire row)
*/

async function get100LatestPOST() {
    const client = new Client(connectionString);
    try {
        await client.connect();

        let result = await client.query(
            `SELECT * FROM memeEntries
            ORDER BY id DESC LIMIT 100 `);
        return (result.rows);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// get100LatestPOST().then(now => console.log(now));



/*  GET @ /memes/active/<limit>
    excpects int value for limit
    returns all information for recent most <limit> modified rows
*/

async function getMostActive(modifiedLimit) {
    const client = new Client(connectionString);
    try {
        await client.connect();

        let result = await client.query(
            `SELECT * FROM memeEntries
            ORDER BY modified DESC LIMIT ${modifiedLimit} `);
        return (result.rows);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// getMostActive(10).then(now => console.log(now));


/*  GET @ /memes/newest/<limit>
    excpects int value for limit
    returns all information for recent most <limit> newest rows
*/

async function getNewest(idLimit) {
    const client = new Client(connectionString);
    try {
        await client.connect();

        let result = await client.query(
            `SELECT * FROM memeEntries
            ORDER BY id DESC LIMIT ${idLimit} `);
        return (result.rows);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// getNewest(10).then(now => console.log(now));


/*  GET @ /memes/next/<id>
    excpects valid id or empty field
    if id is an invalid integer, handles accordingly
    returns first row or previous row (displayed as next) depending on the parameter
    UNIT Pagination
*/

async function getPrevious(offset) {
    const client = new Client(connectionString);
    try {
        
        if ( offset == null || offset.length === 0 ) {
            await client.connect();
            let sequence_name = await client.query(
                `SELECT pg_get_serial_sequence('memeEntries', 'id');`);
            sequence_name = sequence_name.rows[0]["pg_get_serial_sequence"];
            let result = await client.query(
                `SELECT * FROM memeEntries WHERE id = 
                (SELECT last_value FROM ${sequence_name});`
            );
            return (result.rows[0]);
        } else {
            await client.connect();
            let result = await client.query(
                `SELECT * FROM memeEntries WHERE id < ${offset}
                ORDER BY id DESC LIMIT 1 ;`
            );
            return (result.rows[0]);
        }
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// getPrevious(42).then(now => console.log(now));


/*  PATCH @ /memes/<id>
    excpects valid id
    will also take up new values for the username, caption, imageURL
    returns error stack on error, result otherwise
*/

async function patchField(id, username, caption, imageURL) {
    const client = new Client(connectionString);
    try {
        await client.connect();
        let result = await client.query(
            `UPDATE memeEntries
            SET username = '${username}', 
                caption = '${caption}',
                imageURL = '${imageURL}'
            WHERE id = ${id};`);
        return (result);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// patchField(1, 'hi', 'there', 'mister').then(now => console.log(now));


/*  PATCH @/memes/<id>
    expect valid id
    and no other data
    increments like field by 1
    returns error stack on error, result otherwise
*/

async function incrementLike(id) {
    const client = new Client(connectionString);
    try {
        await client.connect();
        let result = await client.query(
            `UPDATE memeEntries
            SET likes = likes + 1
            WHERE id = ${id};`);
        return (result);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// incrementLike(1).then(now => console.log(now));


/*  Uncomment the following to check that DB is properly connected
    Should ideally print to console / terminal, the current timestamp. */
// pool.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   pool.end()
// })

// exporting the functions for further usage, in server.js
module.exports = {
    initTable, insertMeme, getMeme, get100LatestPOST, getPrevious,
    getMostActive, getNewest, patchField, incrementLike
};