const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/threads/:board')
      .send({
        board: 'Test name',
        text: 'This is a placeholder for testing'
      })
      .end(function (err, res) {
        const { board, text } = res.body;
        assert.equal(res.status, 201);
        assert.equal(board, 'Test name');
        assert.equal(text, 'This is a placeholder for testing')
        assert.equal(res.body.replycount, 0);
        assert.exists(res.body._id);
        assert.exists(res.body.created_on);
        assert.exists(res.body.reported);
        assert.exists(res.body.delete_password);
        done();
      });
  });
  test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/threads/:board')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        assert.isAtMost(res.body[0].replies.length, 3);
        done();
      });
  });
  test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/threads/:board')
      .send({
        board: 'Test name',
        thread_id: '60b6e0e4a9c1e5a9f9f9f9f',
        delete_password: 'incorrect'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });
  test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/threads/:board')
      .send({
        board: 'Test name',
        thread_id: '60b6e0e4a9c1e5a9f9f9f9f',
        delete_password: 1234
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      }
  });
  test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/threads/:board')
      .send({
        board: 'Test name',
        thread_id: '60b6e0e4a9c1e5a9f9f9f9f',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      })
  });
  test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/replies/:board')
      .send({
        board: 'Test name',
        thread_id: '60b6e0e4a9c1e5a9f9f9f9f',
        text: 'This is a placeholder for testing',
        delete_password: 1234
      })
      .end(function (err, res) {
        const { board, text } = res.body;
        assert.equal(res.status, 201);
        assert.equal(board, 'Test name');
        assert.equal(text, 'This is a placeholder for testing')
        assert.exists(res.body._id);
        assert.exists(res.body.created_on);
        assert.exists(res.body.reported);
        assert.exists(res.body.delete_password);
        done();
      });
  });
  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/replies/:board')
      .query({
        thread_id: '60b6e0e4a9c1e5a9f9f9f9f'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.board, 'Test name');
        assert.equal(res.body.text, 'This is a placeholder for testing');
        assert.equal(res.body.replies[0].text, 'This is a placeholder for testing');
        assert.exists(res.body.replies[0].created_on);
        assert.exists(res.body.replies[0].reported);
        assert.exists(res.body.replies[0].delete_password);
        done();
      })
  });
  test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/replies/:board')
      .send({
        board: 'Test name',
        thread_id: '60b6e0e4a9c1e5a9f9f9f9f',
        reply_id: '60b6e0e4a9c1e5a9f9f9f9f',
        delete_password: 'incorrect'
      })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.equal(res.text, 'incorrect password');
      done();
    })
  });
  test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/replies/:board')
      .send({
        board: 'Test name',
        thread_id: '60b6e0e4a9c1e5a9f9f9f9f',
        reply_id: '60b6e0e4a9c1e5a9f9f9f9f',
        delete_password: 1234
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      })
  });
  test('Reporting a reply: PUT request to /api/replies/{board}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .put('/api/replies/:board')
      .send({
        board: 'Test name',
        thread_id: '60b6e0e4a9c1e5a9f9f9f9f',
        reply_id: '60b6e0e4a9c1e5a9f9f9f9f'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      })
  });
});
