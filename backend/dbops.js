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
    name provided by the client
    caption provided by the client
    url verified and provided by the client
    like -> an int which increments with every empty PATCH request
    modified -> a timestamp to get track of latest entries
    Added trigger update_modified for updating modified to latest tuple patch
    Added contraint to identify unique POST requests pre-transaction
*/

function initTable() {
    pool.query(
        `CREATE TABLE IF NOT EXISTS memeEntries( 
            id SERIAL PRIMARY KEY, 
            name VARCHAR(100) NOT NULL, 
            caption VARCHAR(100) NOT NULL, 
            url VARCHAR(2048) NOT NULL, 
            likes INTEGER DEFAULT 0,
            modified TIMESTAMP DEFAULT NOW());
        
        CREATE OR REPLACE FUNCTION update_modified() RETURNS trigger
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
        ADD CONSTRAINT uniqueMemeParams UNIQUE(caption, url);`, 
        (err, res) => {
            console.log(err, res);
        }
    );
}

// initTable(); // Only needed for initial call, handled by server.js

/*  POST @ /memes
    excpects validated data
    returns a key-value pair (dict) JSON for successfully posted meme
*/

async function insertMeme(username, caption, imageURL) {
    const client = new Client(connectionString);
    try {
        await client.connect();

        let result = await client.query(
            `INSERT INTO memeEntries (name, caption, url) 
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
// insertMeme('Rick Astley', 'Never Gonna Let You Down', 'https://nerdist.com/wp-content/uploads/2020/07/maxresdefault.jpg').then(ret => console.log(ret.id));


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
// getMeme('1').then(ret => console.log(ret));


/*  GET @ /memes
    excpects null
    returns all information for latest 100 POST requests (entire row)
*/

async function get100LatestPOST() {
    const client = new Client(connectionString);
    try {
        await client.connect();

        let result = await client.query(
            `SELECT id, name, caption, url FROM memeEntries
            ORDER BY id DESC LIMIT 100 `);
        return (result.rows);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// get100LatestPOST().then(ret => console.log(ret));



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
// getMostActive(10).then(ret => console.log(ret));


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
// getNewest(10).then(ret => console.log(ret));


/*  GET @ /memes/prev/<id>
    excpects valid id or empty field
    if id is an invalid integer, handles accordingly
    returns first row or previous row (displayed as next) depending on the parameter
    returns undefined if the first id is passed
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
// getPrevious(0).then(ret => console.log(ret));


/*  GET @ /memes/next/<id>
    excpects valid id or empty field
    if id is an invalid integer, handles accordingly
    returns last row or next row (displayed as previous) depending on the parameter
    returns undefined if the last id is passed
    UNIT Pagination
*/

async function getNext(offset) {
    const client = new Client(connectionString);
    try {
        
        if ( offset == null || offset.length === 0 ) {
            let result = await client.query(
                `SELECT * FROM memeEntries 
                FETCH FIRST ROW ONLY;`
            );
            return (result.rows[0]);
        } else {
            await client.connect();
            let result = await client.query(
                `SELECT * FROM memeEntries WHERE id > ${offset}
                ORDER BY id ASC LIMIT 1 ;`
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
// getNext(4).then(ret => console.log(ret));


/*  PATCH @ /memes/<id>
    excpects valid id
    will also take up new values for the caption, url
    returns error stack on error, result otherwise
*/

async function patchField(id, caption, imageURL) {
    const client = new Client(connectionString);
    try {
        await client.connect();
        let result = await client.query(
            `UPDATE memeEntries
            SET caption = '${caption}',
                url = '${imageURL}'
            WHERE id = ${id};`);
        return (result.rowCount);
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// patchField(28, 'thee', 'mister').then(ret => console.log(ret));


/*  PATCH @/memes/likes/<id>
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
// incrementLike(1).then(ret => console.log(ret));


/*  Uncomment the following to check that DB is properly connected
    Should ideally print to console / terminal, the current timestamp. */
// pool.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   pool.end()
// })

// exporting the functions for further usage, in server.js
module.exports = {
    initTable, insertMeme, getMeme, get100LatestPOST, getPrevious,
    getNext, getMostActive, getNewest, patchField, incrementLike
};