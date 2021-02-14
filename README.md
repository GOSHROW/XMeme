# XMeme-cwod2b
**cwod stage 2b**

The app has been divided into two parts: frontend and backend. And both have been deployed seperately.

Go ahead with cloning the repo and cd into its directory. 

### For Ubuntu 18

```
chmod +x install.sh
sudo ./install.sh

chmod +x server_run.sh
./server_run.sh &

chmod +x sleep.sh
./sleep.sh
```

Would work out to set up your node server at port 8081, publish the swagger at port 8080 and open up a Postgresql connection string at port 5432

### Others

1. Install latest versions of node and npm
1. Install the backend packages from backend directory, by  ```npm i```
1. Install postgresql locally and ensure that the DB is accessible as ```postgresql://postgres:postgres@localhost:5432/postgres```
1. Start the server by ```npm start``` from your backend directory

## Frontend ?

It's vanilla, You are good to go live. Just navigate to the HTML files of the frontend on your browser.
