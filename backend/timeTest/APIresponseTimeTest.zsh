#! /bin/zsh -

# run script just after creating the DB and ensure the backend api is on

# make 100 POST requests
for i in {1..100}
do
    echo $i
    dataraw='{"name": "swapnil", "url": "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg", "caption": "This is a meme '$i'"}'
    curl  --silent --location --request POST 'http://localhost:8081/memes' --header 'Content-Type: application/json' --data-raw  $dataraw > /dev/null
done

# GET for minimum 100 posts
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8081/memes > getAt100

# make 1000 POST requests
for i in {102..1000}
do
    echo $i
    dataraw='{"name": "swapnil", "url": "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg", "caption": "This is a meme '$i'"}'
    curl  --silent --location --request POST 'http://localhost:8081/memes' --header 'Content-Type: application/json' --data-raw  $dataraw > /dev/null
done

# GET for minimum 1000 posts
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8081/memes > getAt1k

# make 10k POST requests
for i in {1002..10000}
do
    echo $i
    dataraw='{"name": "swapnil", "url": "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg", "caption": "This is a meme '$i'"}'
    curl  --silent --location --request POST 'http://localhost:8081/memes' --header 'Content-Type: application/json' --data-raw  $dataraw  > /dev/null
done

# GET for minimum 10k posts
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8081/memes > getAt10k
