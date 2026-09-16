// src/components/AppointmentCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaUserMd,
  FaVideo,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaChevronRight,
} from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import "../styles/AppointmentCard.css";

const AppointmentCard = ({ appointment, onCancel }) => {
  const navigate = useNavigate();

  const {
    _id,
    doctorName,
    doctorSpecialization,
    doctorImage,
    appointmentDate,
    timeSlot,
    reason,
    status,
    consultationMode,
    meetingLink,
    paymentStatus,
    paymentAmount,
  } = appointment;

  // ✅ Fallback if doctorName is missing
  const displayDoctorName = doctorName || "Unknown Doctor";
  const displaySpecialization = doctorSpecialization || "General";

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isUpcoming =
    status === "Pending" || status === "Approved" || status === "OPENING";

  const getModeIcon = () => {
    switch (consultationMode) {
      case "Video":
        return <FaVideo />;
      case "Phone":
        return <FaPhoneAlt />;
      case "In-Person":
        return <FaMapMarkerAlt />;
      default:
        return <FaUserMd />;
    }
  };

  const getModeLabel = () => {
    switch (consultationMode) {
      case "Video":
        return "Video Call";
      case "Phone":
        return "Phone Call";
      case "In-Person":
        return "In-Person";
      default:
        return consultationMode || "N/A";
    }
  };

  const handleCardClick = () => {
    navigate(`/user/appointment/${_id}`);
  };

  return (
    <div className="appointment-card" onClick={handleCardClick}>
      <div className="appointment-card-header">
        <div className="doctor-info">
          {doctorImage ? (
            <img src={doctorImage} alt={displayDoctorName} className="doctor-avatar" />
          ) : (
            <div className="doctor-avatar-placeholder">
              <FaUserMd />
            </div>
          )}
          <div className="doctor-details">
            <h4 className="doctor-name">{displayDoctorName}</h4>
            <span className="doctor-specialization">{displaySpecialization}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="appointment-card-body">
        <div className="appointment-info-grid">
          <div className="info-item">
            <FaCalendarAlt className="info-icon" />
            <span className="info-text">{formatDate(appointmentDate)}</span>
          </div>
          <div className="info-item">
            <FaClock className="info-icon" />
            <span className="info-text">{timeSlot || "N/A"}</span>
          </div>
          <div className="info-item">
            {getModeIcon()}
            <span className="info-text">{getModeLabel()}</span>
          </div>
          {paymentAmount > 0 && (
            <div className="info-item">
              <span className="info-text payment-amount">
                ${paymentAmount.toFixed(2)}
              </span>
              <span className={`payment-status ${paymentStatus?.toLowerCase() || "pending"}`}>
                {paymentStatus || "Pending"}
              </span>
            </div>
          )}
        </div>

        {reason && (
          <div className="appointment-reason">
            <span className="reason-label">Reason:</span>
            <span className="reason-text">{reason}</span>
          </div>
        )}

        {isUpcoming && meetingLink && (
          <div className="meeting-link-container">
            <FaVideo className="meeting-icon" />
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="meeting-link"
            >
              Join Meeting
            </a>
          </div>
        )}
      </div>

      <div className="appointment-card-footer">
        {isUpcoming && onCancel && (
          <button
            className="cancel-btn"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(appointment);
            }}
          >
            Cancel
          </button>
        )}
        <button className="view-details-btn" onClick={handleCardClick}>
          View Details <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;