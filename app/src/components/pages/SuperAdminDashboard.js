import React from "react";

const SuperAdminDashboard = (props) => {
  return (
    <div>
      <h1>Hello, {props.user.name}!</h1>
      <h3>SuperAdmin Dashboard</h3>
    </div>
  );
};

export default SuperAdminDashboard;
