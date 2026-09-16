// src/components/AppointmentFilter.jsx
import React, { useState } from "react";
import "../styles/AppointmentFilter.css";

const AppointmentFilter = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    status: initialFilters.status || "All",
    startDate: initialFilters.startDate || "",
    endDate: initialFilters.endDate || "",
    search: initialFilters.search || "",
  });

  const statusOptions = [
    { value: "All", label: "All Appointments" },
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Completed", label: "Completed" },
    { value: "Rejected", label: "Rejected" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const cleared = {
      status: "All",
      startDate: "",
      endDate: "",
      search: "",
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div className="appointment-filter">
      <div className="filter-row">
        <div className="filter-group">
          <label>Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="filter-select"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>From Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group filter-search">
          <label>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by doctor or reason..."
            className="filter-input"
          />
        </div>

        <button className="clear-filters-btn" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default AppointmentFilter;