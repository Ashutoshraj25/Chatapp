const Chat = require("../models/Chat");
const Thread = require("../models/Thread");
const asyncHandler = require("../utils/asyncHandler");
const { getIO, onlineUsers } = require("../socket/socket");

exports.sendMessage = asyncHandler(async (req, res) => {
  const { sender, receiver, message } = req.body;

  if (!sender || !receiver || !message)
    return res.status(400).json({ message: "Missing fields" });

  let thread = await Thread.findOne({
    participants: { $all: [sender, receiver] },
  });

  if (!thread) {
    thread = await Thread.create({
      participants: [sender, receiver],
    });
  }

  const chat = await Chat.create({
    sender,
    receiver,
    message,
    thread: thread._id,
  });

  thread.lastMessage = message;
  thread.lastMessageTime = new Date();
  await thread.save();

  const receiverSocket = onlineUsers.get(receiver);

  if (receiverSocket) {
    getIO().to(receiverSocket).emit("new_message", chat);
  }

  res.status(201).json(chat);
});

exports.lastMessages = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const messages = await Chat.find({ thread: threadId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(messages);
});
