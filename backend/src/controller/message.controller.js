import { cloudinary } from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, video } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !video) {
      return res.status(400).json({ message: "Text, image, or video is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl, videoUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    if (video) {
      // upload base64 video to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: "video",
        chunk_size: 6000000,
      });
      videoUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    // Only sender can delete their own message
    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "You can only delete your own messages." });
    }

    // Soft delete the message
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Emit to both users
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    const senderSocketId = getReceiverSocketId(message.senderId);
    
    console.log('🔴 Emitting messageDeleted:', { messageId, deletedAt: message.deletedAt });
    console.log('🔴 Receiver socket ID:', receiverSocketId);
    console.log('🔴 Sender socket ID:', senderSocketId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId, deletedAt: message.deletedAt });
      console.log('🔴 Emitted to receiver');
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", { messageId, deletedAt: message.deletedAt });
      console.log('🔴 Emitted to sender');
    }

    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      reaction => reaction.userId.equals(userId) && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove the reaction
      message.reactions = message.reactions.filter(
        reaction => !(reaction.userId.equals(userId) && reaction.emoji === emoji)
      );
    } else {
      // Add the reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Emit to both users
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    const senderSocketId = getReceiverSocketId(message.senderId);
    
    console.log('😊 Emitting messageReacted:', { messageId, reactions: message.reactions });
    console.log('😊 Receiver socket ID:', receiverSocketId);
    console.log('😊 Sender socket ID:', senderSocketId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReacted", { messageId, reactions: message.reactions });
      console.log('😊 Emitted to receiver');
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReacted", { messageId, reactions: message.reactions });
      console.log('😊 Emitted to sender');
    }

    res.status(200).json({ reactions: message.reactions });
  } catch (error) {
    console.log("Error in reactToMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};