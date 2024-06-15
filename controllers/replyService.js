const Reply = require('./replies');

const deleteRepliesForThread = async (threadId) => {
  await Reply.deleteMany({ _id: { $in: threadId.replies } });
};

module.exports = {
  deleteRepliesForThread,
};