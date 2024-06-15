const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const threadSchema = new Schema({
  board: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date
  },
  bumped_on: {
    type: Date
  },
  reported: {
    type: Boolean
  },
  delete_password: {
    type: String,
    required: true
  },
  replies: {
    type: [ Object ]
  },
  replycount: {
    type: Number
  }
});
const Thread = model('Thread', threadSchema);

const postThread = async (req, res) => {
  const { board, text, delete_password } = req.body;
  const hashedPassword = await bcrypt.hash(delete_password, 10);
  
  try {
    const thread = new Thread({
      board,
      text,
      delete_password: hashedPassword,
      created_on: new Date(),
      bumped_on: new Date(),
      replycount: 0
    });
    await thread.save();
    
    res.redirect(`/b/${board}/`);
    
  } catch(error) {
    return res.status(500).json({ error: 'Error creating thread' });
  }
};

const reportThread = async (req, res) => {
  const { board, thread_id } = req.body;
  try {
    const thread = await Thread.findOne({ _id: thread_id });
    if (thread) {
      thread.reported = true;
      await thread.save();
      res.send('reported');
    } else {
      res.send('thread not found');
    }
  } catch(error) {
    return res.status(500).json({ error: 'Error reporting thread' });
  }
}

const deleteThread = async (req, res) => {
  const { board, thread_id, delete_password } = req.body;
  try {
    const thread = await Thread.findOne({ _id: thread_id });
    if (thread) {
      const isMatch = await bcrypt.compare(delete_password, thread.delete_password);
      if (isMatch) {
        await Thread.deleteOne({ _id: thread_id });
        res.send('success');
      } else {
        res.send('incorrect password');
      }
    } else {
      res.send('thread not found');
    }
  } catch(error) {
    return res.status(500).json({ error: 'Error deleting thread' });
  }
}

const getThread = async (req, res) => {
  const { board } = req.params;
  try {
    const threads = await Thread.find({ board }).sort({ bumped_on: -1 }).limit(10);
    
    res.json(threads);
  
  } catch(error) {
    return res.status(500).json({ error: 'Error retrieving threads' });
  }
}

module.exports = {
  Thread,
  postThread,
  reportThread,
  deleteThread,
  getThread
}
