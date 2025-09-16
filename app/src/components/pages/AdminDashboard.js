import React from "react";

const AdminDashboard = (props) => {
  return (
    <div>
      <h1>Hello, {props.user.name}!</h1>
      <h3>Admin Dashboard</h3>
    </div>
  );
};

export default AdminDashboard;
