import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { toast } from "react-toastify";

const GroupPage = () => {
  const { authUser } = useContext(AuthContext);
  const { socket, setCurrentGroupId } = useContext(ChatContext);

  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");

  if (!authUser || !authUser._id) {
    return (
      <div className="text-white text-center mt-10">
        Please login to create or join a group.
      </div>
    );
  }
  // create group
  const createGroup = async () => {
    try {
      const res = await axios.post("/api/groups/create", {
        name: groupName,
        userId: authUser._id,
      });
      socket.emit("joinGroup", res.data._id);
      setCurrentGroupId(res.data._id);
      toast.success(`✅ Created and joined group: ${res.data.name}`);
      setGroupName(""); // clear input
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create group");
    }
  };

  // join group
  const joinGroup = async () => {
    try {
      const res = await axios.post("/api/groups/join", {
        groupId,
        userId: authUser._id,
      });
      socket.emit("joinGroup", groupId);
      setCurrentGroupId(groupId);
      toast.success(`✅ Joined group: ${res.data.name}`);
      setGroupId(""); // clear input
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to join group");
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bgImage.svg')] bg-cover bg-center bg-no-repeat backdrop-blur-md flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md p-6 bg-[#282142] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Group Chat</h2>

        {/* Create Group */}
        <div className="mb-5">
          <input
            className="text-white p-3 rounded w-full mb-2"
            placeholder="New Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button
            onClick={createGroup}
            disabled={!groupName}
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Create Group
          </button>
        </div>

        {/* Join Group */}
        <div>
          <input
            className="text-white p-3 rounded w-full mb-2"
            placeholder="Enter Group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />
          <button
            onClick={joinGroup}
            disabled={!groupId}
            className="w-full bg-green-600 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Join Group
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-600 mt-4 py-2 rounded hover:bg-gray-700"
        >
          ← Back to Chat
        </button>
      </div>
    </div>
  );
};

export default GroupPage;
