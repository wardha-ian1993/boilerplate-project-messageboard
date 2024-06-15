const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const { Thread } = require('./threads');

const replySchema = new Schema({
  text: {
    type: String,
    required: true
  },
  thread_id: {
    type: String
  },
  created_on: {
    type: Date
  },
  reported: {
    type: Boolean
  },
  delete_password: {
    type: String,
    required: true
  }
});
const Reply = model('Reply', replySchema);

const postReply = async (req, res) => {
  const { thread_id, text, delete_password } = req.body;
  const hashedPassword = await bcrypt.hash(delete_password, 10);

  let board = req.body.board;
  
  try {
    const thread = await Thread.findOne({ _id: thread_id });
    if (thread) {
      const reply = new Reply({
        text,
        thread_id,
        created_on: new Date(),
        reported: false,
        delete_password: hashedPassword
      });
      await reply.save();
      
      thread.bumped_on = new Date();
      thread.replies.push(reply);
      thread.replycount = thread.replies.length;
      await thread.save();

      if (!board) {
        board = thread.board;
      }
      res.redirect(`/b/${board}/${thread_id}`);
    } else {
      res.send('thread not found');
    }
  } catch(error) {
    return res.status(500).json({ error: `Error creating reply: ${error}` });
  }
};

const reportReply = async (req, res) => {
  const { board, thread_id, reply_id } = req.body;
  try {
    const thread = await Thread.findOne({ _id: thread_id });
    if (thread) {
      const reply = await Reply.findOne({ _id: reply_id });
      if (reply) {
        reply.reported = true;
        await reply.save();

        const replyIndex = thread.replies.findIndex(r => r._id.toString() === reply_id);
        if (replyIndex !== -1) {
          thread.replies[replyIndex] = reply;
          await thread.save();
          res.send('success');
        } else {
          res.send('reply not found in thread');
        }
      } else {
        res.send('reply not found');
      }
    } else {
      res.send('thread not found');
    }
  } catch (error) {
    return res.status(500).json({ error: `Error reporting reply: ${error}` });
  }
};

const deleteReply = async (req, res) => {
  const { board, thread_id, reply_id, delete_password } = req.body;

  try {
    const thread = await Thread.findOne({ _id: thread_id });
    if (thread) {
      const reply = await Reply.findOne({ _id: reply_id });
      if (reply) {
        const isMatch = await bcrypt.compare(delete_password, reply.delete_password);
        if (isMatch) {
          reply.text = '[deleted]';
          await reply.save();

          const replyIndex = thread.replies.findIndex(r => r._id.toString() === reply_id);
          if (replyIndex !== -1) {
            thread.replies[replyIndex] = reply;
            await thread.save();
            res.send('success');
          } else {
            res.send('reply not found in thread');
          }
        } else {
          res.send('incorrect password');
        }
      } else {
        res.send('reply not found');
      }
    } else {
      res.send('thread not found');
    }
  } catch (error) {
    return res.status(500).json({ error: `Error deleting reply: ${error}` });
  }
};

const getReply = async (req, res) => {
  const { thread_id } = req.query;
  try {
    const thread = await Thread.findOne({ _id: thread_id });
    if (thread) {
      res.json(thread);
    } else {
      res.send('thread not found');
    }
  } catch (error) {
    return res.status(500).json({ error: `Error retrieving replies: ${error}` });
  }
}

module.exports = {
  Reply,
  postReply,
  reportReply,
  deleteReply,
  getReply
}
  