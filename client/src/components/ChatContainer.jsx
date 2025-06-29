import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    getGroupMessages,
    currentGroupId,
    sendGroupMessage, // ✅ Use this instead of socket.emit directly
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const scrollEnd = useRef();
  const messagesContainerRef = useRef();

  const isUserAtBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return false;
    return container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else if (currentGroupId) {
      getGroupMessages(currentGroupId);
    }
  }, [selectedUser, currentGroupId]);

  useEffect(() => {
    if (scrollEnd.current && messages && isUserAtBottom()) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      if (selectedUser) {
        await sendMessage({ text: input.trim() });
      } else if (currentGroupId) {
        sendGroupMessage({ text: input.trim() });
      }
      setInput("");
    } catch (error) {
      toast.error("Message failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select a valid image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setIsSending(true);
      try {
        if (selectedUser) {
          await sendMessage({ image: reader.result });
        } else if (currentGroupId) {
          sendGroupMessage({ image: reader.result });
        }
        e.target.value = "";
      } catch (error) {
        toast.error("Failed to send image");
      } finally {
        setIsSending(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderHeader = () => {
    if (selectedUser) {
      return (
        <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
          <img src={selectedUser.profilePic || assets.avatar_icon} alt="User" className="w-8 rounded-full" />
          <p className="flex-1 text-lg text-white flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="Back"
            className="md:hidden max-w-7"
          />
        </div>
      );
    } else if (currentGroupId) {
      return (
        <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
          <p className="flex-1 text-lg text-white">Group Chat</p>
        </div>
      );
    }
    return null;
  };

  return selectedUser || currentGroupId ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {renderHeader()}

      {/* 💬 Chat Area */}
      <div
        ref={messagesContainerRef}
        className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6"
      >
        {messages.map((msg, index) => {
          if (!msg || (!msg.text && !msg.image)) return null;
          const isSender = msg.senderId === authUser._id;

          return (
            <div
              key={index}
              className={`flex items-end gap-2 justify-end ${!isSender && "flex-row-reverse"}`}
            >
              <div className="max-w-[230px] mb-8">
                {currentGroupId && !isSender && (
                  <p className="text-xs text-gray-400 mb-1">{msg.senderName || "User"}</p>
                )}
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="Shared"
                    className="border border-gray-700 rounded-lg overflow-hidden"
                  />
                ) : (
                  <span
                    className={`p-2 md:text-sm font-light rounded-lg break-all bg-violet-500/30 text-white ${
                      isSender ? "rounded-br-none" : "rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </span>
                )}
              </div>
              <div className="text-center text-xs">
                <img
                  src={authUser?.profilePic || assets.avatar_icon}
                  alt="avatar"
                  className="w-7 rounded-full"
                />
                <p className="text-gray-500">{msg.createdAt ? formatMessageTime(msg.createdAt) : ""}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* ⌨️ Bottom Input */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="mr-2 text-xl"
          >
            😊
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-10">
              <Picker
                data={data}
                onEmojiSelect={(emoji) => setInput((prev) => prev + emoji.native)}
                theme="dark"
              />
            </div>
          )}

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
            disabled={isSending}
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpg, image/jpeg"
            hidden
            disabled={isSending}
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="Upload"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="Send"
          className={`w-7 cursor-pointer ${isSending ? "opacity-50" : ""}`}
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="Chat logo" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
