# APIs and Microservices 4: Exercise Tracker Project

### User Stories

1. I can create a user by sending a `POST` request with a username to `[project_url]/api/shorturl/new` and receive an object with `username` and `userID` as a response. Example: `{ "username": "testUser", "userId": "NeElC0NT" }`
2. If a user with the same username already exists, return the status code 400 and the message "Username already taken".
3. I can get an array of all users by sending a `GET` request to `api/exercise/users`. Example: `{ ["username": "testUser", "userId": "NeElC0NT", "username": "anotherTestUser", "userId": "mSiizWbVz"] }`
4. I can add an exercise for any user by sending a `POST` request with `userId(_id)`, `description`, `duration`, and optionally `date` (yyyy-mm-dd) as parameters to `/api/exercise/add`. If no `date` supplied it will use current date. Returned will be the user object with the exercise fields added. Example: `{ "userId": "NeElC0NT", "description": "Walk", "duration": 40, "date": "Thu Dec 26 2019", "username": "testUser" }`
5. I can retrieve the full exercise log of any user by sending a `GET` request to `/api/exercise/log` with the parameter `userId(_id)`. Returned will be the user object with `log`, an array of all exercises, and `count`, the total exercise count. Example: `{ "userId": "NeElC0NT", "username": "testUser", "count": 2, "log": [ { "description": "Walk", "duration": 40, date: "Thu Dec 26 2019" }, { "description": "Run", "duration": 30, date: "Wed Dec 25 2019" } ] }`
6. I can retrieve part of the log for any user by also passing along the optional parameters `from` and `to` or `limit`. The `from` and `to` dates should be in the yyyy-mm-dd format, and `limit` should be an integer.
