// src/components/StatusBadge.jsx
import React from "react";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaCalendarCheck,
  FaBan,
} from "react-icons/fa";
import "../styles/StatusBadge.css";

const StatusBadge = ({ status, size = "medium", showIcon = true }) => {
  const statusConfig = {
    Pending: {
      label: "Pending",
      color: "#FF9800",
      bgColor: "#FFF3E0",
      icon: <FaClock />,
    },
    OPENING: {
      label: "Pending",
      color: "#FF9800",
      bgColor: "#FFF3E0",
      icon: <FaClock />,
    },
    Approved: {
      label: "Approved",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
      icon: <FaCheckCircle />,
    },
    Completed: {
      label: "Completed",
      color: "#2196F3",
      bgColor: "#E3F2FD",
      icon: <FaCalendarCheck />,
    },
    Rejected: {
      label: "Rejected",
      color: "#F44336",
      bgColor: "#FFEBEE",
      icon: <FaTimesCircle />,
    },
    Cancelled: {
      label: "Cancelled",
      color: "#9E9E9E",
      bgColor: "#F5F5F5",
      icon: <FaBan />,
    },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  const sizeClasses = {
    small: "badge-small",
    medium: "badge-medium",
    large: "badge-large",
  };

  return (
    <span
      className={`status-badge ${sizeClasses[size]}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.color,
      }}
    >
      {showIcon && <span className="badge-icon">{config.icon}</span>}
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

export default StatusBadge;