# study-todo-server
This is the simple server app for practicing working with API

Difference form public APIs like https://jsonplaceholder.typicode.com/todos is: this server is able to save changes. 
But its storage is not permanent: all saved data lost after its shutdown / restart

For starting server, at first you should install all necessary packages:

`$ npm install`

Then you can run it using

`$ npm run start`

## Main features
After starting the server you'll have 3 main routes: /auth, /list, /todo

You can review and try all the API methods on http://localhost:4000/docs

The server suggests authorisation (see methods in /auth). Authorisation sets httpOnly cookie. Non-authorised user cannot use any methods from /todo, or /list

### Presets
There are 4 users, and several empty lists for each of user (the presets data is stored at `./_initData/data.json` in sources).

This is the list of users (email / password):
- user1@test.net / 1111
- user2@test.net / 2222
- user3@test.net / 3333
- user4@test.net / 4444
- user5@test.net / 5555

## Little sample of using
The main feature you should use working to server is: "Content-type":"application/json" in request headers

The sample of request using fetch:
```javascript
const response = await fetch("/auth/login", {
    method: "POST",
    headers: {
        "Content-type":"application/json"
    },
    body: JSON.stringify({ email: "user1@test.net", password: "1111" }),
});
if (rawResponse.ok) {
    const content = await response.json();
    console.log(content);
} else {
    console.error(rawResponse)
}
```

## CORS
The authorisation will work when you send request from localhost:4000. This is connected to the cookies security.

For react application, if it was created using [https://create-react-app.dev/](create-react-app) for developing purpose you should edit your package.json file.

Put the following line (set the requests proxying), and send requests like server works on the same domain, and port

`  "proxy": "http://localhost:4000", `
