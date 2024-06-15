'use strict';

const { postThread, reportThread, deleteThread, getThread } = require('../controllers/threads');
const { postReply, reportReply, deleteReply, getReply } = require('../controllers/replies');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(postThread)
    .put(reportThread)
    .delete(deleteThread)
    .get(getThread);

  app.route('/api/replies/:board')
    .post(postReply)
    .put(reportReply)
    .delete(deleteReply)
    .get(getReply);
};