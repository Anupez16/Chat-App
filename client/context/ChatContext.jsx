import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);

  const { authUser, axios } = useContext(AuthContext);

  // Connect to Socket.io
  useEffect(() => {
    if (authUser?._id) {
      const newSocket = io("http://localhost:5000", {
        query: { userId: authUser._id },
      });
      setSocket(newSocket);

      return () => newSocket.disconnect(); // cleanup
    }
  }, [authUser]);

  // Track selected user safely in socket handler
  const selectedUserRef = useRef(null);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ✅ Fetch all users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  // ✅ Fetch groups where user is a member
  const getGroups = async () => {
    try {
      const { data } = await axios.get(`/api/groups/user/${authUser._id}`);
      if (data.success) setGroups(data.groups || []);
    } catch (error) {
      toast.error("Failed to fetch groups");
    }
  };

  // ✅ Fetch private messages
  const getMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  // ✅ Fetch messages from group
  const getGroupMessages = async (groupId) => {
    try {
      setLoadingMessages(true);
      const { data } = await axios.get(`/api/groups/${groupId}/messages`);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      toast.error("Failed to fetch group messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  // ✅ Send private message
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
      toast.error("Failed to send message");
    }
  };

  // ✅ Emit group message via socket
  const sendGroupMessage = (messageData) => {
    if (!socket || !currentGroupId) {
      toast.error("No group selected");
      return;
    }

    const message = {
      ...messageData,
      groupId: currentGroupId,
      senderId: authUser._id,
      createdAt: new Date().toISOString(),
    };

    socket.emit("groupMessage", message);
  };

  // ✅ Listen for private messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      const selected = selectedUserRef.current;

      if (selected && newMessage.senderId === selected._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

  // ✅ Listen for group messages
  useEffect(() => {
    if (!socket) return;

    const handleGroupMessage = (msg) => {
      if (msg.groupId === currentGroupId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("groupMessage", handleGroupMessage);
    return () => socket.off("groupMessage", handleGroupMessage);
  }, [socket, currentGroupId]);

  // Auto-load groups on login
  useEffect(() => {
    if (authUser?._id) {
      getGroups();
    }
  }, [authUser]);

  const value = {
    socket,
    messages,
    users,
    groups,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    loadingMessages,
    currentGroupId,
    setCurrentGroupId,
    getUsers,
    getGroups,
    getMessages,
    getGroupMessages,
    sendMessage,
    sendGroupMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
