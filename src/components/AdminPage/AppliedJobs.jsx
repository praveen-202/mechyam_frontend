import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, RotateCcw, Download, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [searchJobId, setSearchJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    fetchAllApplications();
  }, [page]);

  const fetchAllApplications = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/career/applications?page=${page}&size=${pageSize}`)
      .then((res) => {
        const data = res.data.data;
        setApplications(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setErrorMsg("");
      })
      .catch(() => {
        setErrorMsg("Failed to load applications.");
        setApplications([]);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    if (!searchJobId.trim()) return fetchAllApplications();
    setLoading(true);

    axios
      .get(`${API_BASE_URL}/api/career/applications/job/${searchJobId}`)
      .then((res) => {
        setApplications(res.data.data || []);
        setTotalPages(1);
        setPage(0);
        setErrorMsg("");
      })
      .catch(() => {
        setErrorMsg("No applications found for this Job ID.");
        setApplications([]);
      })
      .finally(() => setLoading(false));
  };

  const handleReset = () => {
    setSearchJobId("");
    setErrorMsg("");
    setPage(0);
    fetchAllApplications();
  };

  const handleDownload = (id) => {
    window.open(`${API_BASE_URL}/api/career/applications/${id}/resume`, "_blank");
  };

  return (
    <div className="p-3 sm:p-0">

      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-blue-900">
          Applied Candidates
        </h2>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchJobId}
            onChange={(e) => setSearchJobId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Job ID"
            className="border rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none text-sm focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 text-sm w-full sm:w-auto"
            >
              <Search size={18} /> Search
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm w-full sm:w-auto"
            >
              <RotateCcw size={18} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ---------- States ---------- */}
      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && errorMsg && <p className="text-gray-500 text-xl">{errorMsg}</p>}
      {!loading && !errorMsg && applications.length === 0 && (
        <p className="text-gray-500 text-xl">No applications yet.</p>
      )}

      {/* ---------- Header Row (Desktop only) ---------- */}
      {!loading && !errorMsg && applications.length > 0 && (
        <div className="hidden sm:grid grid-cols-5 gap-4 font-semibold text-gray-700 border-b pb-2 mb-2 text-sm">
          <span>Name</span>
          <span className="text-center">Job Code</span>
          <span>Email</span>
          <span>Job Title</span>
          <span className="text-right">Action</span>
        </div>
      )}

      {/* ---------- Rows ---------- */}
      {!loading && !errorMsg && applications.length > 0 && (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"

            >
              {/* ----- Mobile Layout ----- */}
              <div className="sm:hidden flex flex-col gap-2 text-sm">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Name</span>
                  <p className="font-bold text-blue-700">{app.fullName}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500">Job Code</span>
                  <p className="text-gray-700">{app.job?.id}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500">Email</span>
                  <p className="text-gray-600 break-all">{app.email}</p>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-gray-500">Job Title</span>
                    <p className="text-gray-700">{app.job?.jobTitle}</p>
                  </div>

                  <span className="text-blue-700 font-semibold text-sm">View →</span>
                </div>
              </div>

              {/* ----- Desktop Layout ----- */}
              <div className="hidden sm:grid grid-cols-5 gap-4 items-center text-sm">
                <span className="font-bold text-blue-700 truncate">
                  {app.fullName}
                </span>
                <span className="text-center">{app.job?.id}</span>
                <span className="text-gray-600 truncate">{app.email}</span>
                <span className="text-gray-700 truncate">{app.job?.jobTitle}</span>
                <span className="text-blue-700 text-right font-semibold">View →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Pagination ---------- */}
      {!loading && !errorMsg && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-3">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg disabled:opacity-50 w-full sm:w-auto"
          >
            Previous
          </button>

          <span className="text-gray-700 text-sm">
            Page {page + 1} of {totalPages}
          </span>

          <button
            disabled={page + 1 === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      )}

      {/* ---------- Modal ---------- */}
      {selectedApp && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-lg p-4 shadow-xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-2 right-2" onClick={() => setSelectedApp(null)}>
              <X size={22} className="text-gray-600 hover:text-red-500" />
            </button>

            <h3 className="text-xl font-bold text-blue-800 border-b pb-2 mb-3">
              Candidate Details
            </h3>

            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {selectedApp.fullName}</p>
              <p><strong>Email:</strong> {selectedApp.email}</p>
              <p><strong>Phone:</strong> {selectedApp.phoneNumber}</p>
              <p><strong>Job:</strong> {selectedApp.job?.jobTitle} ({selectedApp.job?.id})</p>
              <p><strong>Department:</strong> {selectedApp.job?.department}</p>

              <p>
                <strong>LinkedIn:</strong>{" "}
                <a href={selectedApp.linkedinUrl} target="_blank" className="text-blue-600 break-all">
                  {selectedApp.linkedinUrl}
                </a>
              </p>

              <p>
                <strong>Portfolio:</strong>{" "}
                <a href={selectedApp.portfolioUrl} target="_blank" className="text-blue-600 break-all">
                  {selectedApp.portfolioUrl}
                </a>
              </p>

              <p>
                <strong>Applied On:</strong>{" "}
                {new Date(selectedApp.applicationDate).toLocaleString()}
              </p>

              <div>
                <strong>Cover Letter:</strong>
                <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-xs max-h-40 overflow-y-auto">
                  {selectedApp.coverLetter}
                </pre>
              </div>
            </div>

            <button
              onClick={() => handleDownload(selectedApp.id)}
              className="mt-4 px-4 py-2 w-full bg-blue-700 text-white rounded-lg hover:bg-blue-900 flex justify-center items-center gap-2"
            >
              <Download size={18} /> Download Resume
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppliedJobs;
