/*
*       
*       To run the tests, open the terminal with [Ctrl + `] (backtick)
*       and run the command `npm run test`
*
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const shortId = require('shortid');

let testUser = {
  username: shortId.generate() // Random username unlikely to be taken by an actual user
}

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(6000);

  suite('Routing Tests', function() {
    
    suite('POST /api/exercise/new-user => New user object', function() {
      
      test('Returns a new user object', function(done) {
        chai.request(server)
          .post('/api/exercise/new-user')
          .send({ username: testUser.username })
          .end((err, res) => {
            assert.strictEqual(res.body.username, testUser.username);
            assert(res.body.userId); // check only for existence of userId -- we don't specify what form it should be in

            testUser = res.body; // store JSON response for later tests
            done();
          });
      });

      test('Returns the expected status code and message when a username is already in the DB', done => {
        chai.request(server)
          .post('/api/exercise/new-user')
          .send({ username: testUser.username })
          .end((err, res) => {
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.text, 'Username already taken');
            done();
          });
      });
      
    });

    suite('POST /api/exercise/add => Tracked exercise object', () => {

      test(`Returns a new exercise JSON object with today's date`, done => {
        const exerciseInfo = {
          userId: testUser.userId,
          description: 'Walk',
          duration: 40,
          date: '' // Don't supply a date
        }

        chai.request(server)
          .post('/api/exercise/add')
          .send(exerciseInfo)
          .end((err, res) => {
            const expected = { 
              ...exerciseInfo,
              date: new Date().toDateString(),
              username: testUser.username,
            }

            assert.deepStrictEqual(res.body, expected);
            done();
          });
      });

      test(`Returns a new exercise JSON object with a specific date`, done => {
        const exerciseInfo = {
          userId: testUser.userId,
          description: 'Run',
          duration: 30,
          date: '2018/6/13'
        }

        chai.request(server)
          .post('/api/exercise/add')
          .send( exerciseInfo )
          .end((err, res) => {
            const expected = { 
              ...exerciseInfo,
              date: 'Wed Jun 13 2018',
              username: testUser.username,
            }

            assert.deepStrictEqual(res.body, expected);
            done();
          });
      });

    });

    suite('GET /api/exercise/users => Array of all user objects', () => {
      
      test('Returns an array of all users', done => {
        chai.request(server)
          .get('/api/exercise/users')
          .end((err, res) => {
            assert.typeOf(res.body, 'array'); // exit early if not an array

            const usernamesArr = res.body.map(obj => obj.username);
            assert(usernamesArr.length > 0);
            assert(usernamesArr.includes(testUser.username));
            done();
          });
      });
      
    });

    suite(`GET /api/exercise/log/[userId] => User's exercise log`, () => {
      
      test(`Returns a user's full exercise log and a total count of exercises`, done => {
        chai.request(server)
          .get('/api/exercise/log')
          .query({ userId: testUser.userId })
          .end((err, res) => {
            const expected = { 
              userId: testUser.userId,
              username: testUser.username,
              count: 2,
              log: [ 
                { description: 'Walk', duration: 40, date: new Date().toDateString() }, // No date was supplied in an earlier test
                { description: 'Run', duration: 30, date: 'Wed Jun 13 2018' } 
              ] 
            }

            assert.deepStrictEqual(res.body, expected);
            done();
          });
      });

      test(`Return part of a user's exercise log by passing from and to dates`, done => {
        // Store another exercise with a specific date
        const exerciseInfo = {
          userId: testUser.userId,
          description: 'Pull ups',
          duration: 10,
          date: '2018/6/14'
        }

        const setup = new Promise((resolve, reject) => {
          chai.request(server)
            .post('/api/exercise/add')
            .send(exerciseInfo)
            .end((err, res) => {
              if (err) console.log(err);
              resolve();
            });
        });

        setup.then(() => {
          chai.request(server)
            .get('/api/exercise/log')
            .query(
              { 
                userId: testUser.userId,
                from: '2018/6/13',
                to: '2018/6/14'
              }
            )
            .end((err, res) => {
              const expected = { 
                userId: testUser.userId,
                username: testUser.username,
                from: 'Wed Jun 13 2018',
                to: 'Thu Jun 14 2018',
                count: 2,
                log: [ 
                  { description: 'Pull ups', duration: 10, date: 'Thu Jun 14 2018' },
                  { description: 'Run', duration: 30, date: 'Wed Jun 13 2018' } 
                ] 
              }

              assert.deepStrictEqual(res.body, expected);
              done();
            });
        });
      });

      test(`Return part of a user's exercise log by passing a limit`, done => {
        chai.request(server)
          .get('/api/exercise/log')
          .query(
            { 
              userId: testUser.userId,
              limit: 2
            }
          )
          .end((err, res) => {
            // Allow for some flexibility for how users implement this limit feature
            assert.strictEqual(res.body.count, 2);
            assert.strictEqual(res.body.log.length, 2);
            done();
          });
      });
      
    });

  });

});
