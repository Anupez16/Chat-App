import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const GroupPage = () => {
  const { authUser } = useContext(AuthContext);
  const { socket, setCurrentGroupId } = useContext(ChatContext);

  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");

  const createGroup = async () => {
    try {
      const res = await axios.post("/api/groups/create", {
        name: groupName,
        userId: authUser._id,
      });
      socket.emit("joinGroup", res.data._id);
      setCurrentGroupId(res.data._id);
      alert("Created and joined group: " + res.data.name);
    } catch (err) {
      console.error(err);
      alert("Failed to create group");
    }
  };

  const joinGroup = async () => {
    try {
      const res = await axios.post("/api/groups/join", {
        groupId,
        userId: authUser._id,
      });
      socket.emit("joinGroup", groupId);
      setCurrentGroupId(groupId);
      alert("Joined group: " + res.data.name);
    } catch (err) {
      console.error(err);
      alert("Failed to join group");
    }
  };

  return (
<div className="min-h-screen bg-[url('/bgImage.svg')] bg-cover bg-center bg-no-repeat backdrop-blur-md flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md p-6 bg-[#282142] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Group Chat</h2>

        <div className="mb-5">
          <input
            className="text-black p-3 rounded w-full mb-2"
            placeholder="New Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button
            onClick={createGroup}
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700"
          >
            Create Group
          </button>
        </div>

        <div>
          <input
            className="text-black p-3 rounded w-full mb-2"
            placeholder="Enter Group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          />
          <button
            onClick={joinGroup}
            className="w-full bg-green-600 py-2 rounded hover:bg-green-700"
          >
            Join Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
