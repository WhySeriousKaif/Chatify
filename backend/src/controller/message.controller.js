import { cloudinary } from "../config/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    // find every single user except the logged in user
    res.status(200).json(filteredUsers);
  } catch (err) {
    console.error("Error in getAllMessages Controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    // me and you messaging
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    return res.status(200).json(messages);
  } catch (err) {}
};
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Please provide either text or image" });
    }
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    const savedMessage = await newMessage.save();

    // send message to other user in real time if user is one line  -socket.io
    res.status(201).json(savedMessage);
  } catch (err) {
    console.log("error in sendMessage controller ", err.message);
  }
};
export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // find all the messages where the logged in user is receiver or sender
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId },
      ],
    });
    const chatPartnerId = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() == loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];
    const chatPartners = await User.find({ _id: { $in: chatPartnerId } }).select(
      "-password"
    );
    return res.status(200).json(chatPartners);
  } catch (err) {
    console.error("error in getChatPartners controller ", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
