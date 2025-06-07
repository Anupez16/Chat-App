import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { socket, axios } = useContext(AuthContext);

  // Ref to avoid stale closure inside socket listener
  const selectedUserRef = useRef(null);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Get users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get messages for a selected user
  const getMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle new message from socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      const currentSelectedUser = selectedUserRef.current;

      if (currentSelectedUser && newMessage.senderId === currentSelectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  const value = {
    messages,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    loadingMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
