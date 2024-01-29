import React, { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  set,
} from "firebase/database";
import { getAuth, deleteUser } from "firebase/auth";
import 'bootstrap/dist/css/bootstrap.css';

function ViewUsers() {
  const [userData, setUserData] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchRole, setSearchRole] = useState(""); // New state for role filter
  const [roles, setRoles] = useState([]); // New state for roles

  useEffect(() => {
    const fetchUserData = () => {
      const database = getDatabase();
      const usersRef = ref(database, "users");

      onValue(usersRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          setUserData(userData);

          // Get unique roles from user data
          const uniqueRoles = [...new Set(Object.values(userData).map((user) => user.role))];
          setRoles(uniqueRoles);
        } else {
          console.log("No user data found.");
        }
      });
    };

    fetchUserData();

    return () => {
      // Cleanup logic here if needed
    };
  }, []);

  const renderUserList = () => {
    const userList = [];

    for (const userId in userData) {
      if (Object.hasOwnProperty.call(userData, userId)) {
        const user = userData[userId];

        if (
          (user.firstName.toLowerCase().includes(searchName.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchName.toLowerCase())) &&
          (searchRole === "" || user.role === searchRole)
        ) {
          userList.push(
            <tr key={userId}>
              <td className="contentTable">{user.role}</td>
              <td className="contentTable">{user.firstName} {user.lastName}</td>
              <td className="contentTable">{user.email}</td>
              <td>
                <button className = "action-buttons" onClick={() => handleDeleteUser(userId)}>Delete</button>
              </td>
            </tr>
          );
        }
      }
    }

    if (userList.length === 0) {
      return (
        <tr>
          <td colSpan="4">No users found.</td>
        </tr>
      );
    }

    return userList;
  };

  const getUserUid = () => {
    try {
      const authInstance = getAuth();
      const user = authInstance.currentUser;

      if (user) {
        return user.uid;
      } else {
        console.error("User is not authenticated.");
        return null;
      }
    } catch (error) {
      console.error("Error getting user UID:", error);
      return null;
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const database = getDatabase();
      const userRef = ref(database, `users/${userId}`);
  
      await remove(userRef);
      console.log("User deleted from Realtime Database successfully.");
  
      const userUid = getUserUid();
  
      if (userUid) {
        const authInstance = getAuth();
  
        await deleteUser(authInstance, userUid);
        console.log("User deleted from Firebase Authentication successfully.");
      } else {
        console.error("User's UID not found.");
      }
  
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };         

  return (
    <div className="form-group">
      <h2 className="headerer">View Users</h2>
  
      {/* Search input */}
      <input
        className="form-control mb-3"
        type="text"
        placeholder="Search by name"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        style={{ fontFamily: "Regular", width: "355px" }}
      />
  
      {/* Role filter dropdown */}
      <select
        className="form-select mb-3"
        value={searchRole}
        onChange={(e) => setSearchRole(e.target.value)}
        style={{ width: "150px" }}
      >
        <option value="">All Roles</option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
  
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th className="th-header">ROLE</th>
              <th className="th-header">NAME</th>
              <th className="th-header">EMAIL</th>
              <th className="th-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody>{renderUserList()}</tbody>
        </table>
      </div>
    </div>
  );
        }
  
  export default ViewUsers;