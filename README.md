# study-todo-server
The sample of request using fetch:
```
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
