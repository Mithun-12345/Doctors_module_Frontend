import React, { useState, useEffect } from "react";
import { Search, Calendar, PlayCircle, Check, Filter } from "lucide-react";
import { FaSortAmountDownAlt } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import config from "../../config";
import { MenuBook, Note } from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MedicineCalendar from "../../components/doctor components/PresTimeSheet";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = config.API_URL;

// Tab Navigation Component
const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-6 mb-6 pl-[20px] pr-[20px]">
      <button
        onClick={() => onTabChange("new-patient")}
        className={`flex-1 px-6 py-3 rounded-lg gap-16 text-base font-medium leading-none transition-colors ${activeTab === "new-patient"
          ? "bg-blue-500 text-white"
          : "bg-white text-gray-700 border border-gray-300"
          }`}
      >
        New Patient
      </button>
      <button
        onClick={() => onTabChange("follow-up")}
        className={`flex-1 px-6 py-3 rounded-lg text-base font-medium leading-none transition-colors ${activeTab === "follow-up"
          ? "bg-blue-500 text-white"
          : "bg-white text-gray-700 border border-gray-300"
          }`}
      >
        Patient Follow-Up
      </button>
    </div>
  );
};

const FeedbackFollowUp = () => {
  const navigate = useNavigate()

  // const dummyTableData = [
  //   {
  //     _id: "test1",
  //     patientName: "Testing_me",
  //     registrationTime: "2025-12-19T05:12:00.000Z",
  //     status: "Pending",
  //     callsMade: "0",
  //     lastCallAttempt: "-",
  //     rescheduledTime: "-",
  //     appDownload: 0,
  //   },
  // ];
  const [data, setData] = useState([]);
  const [newPatientData, setNewPatientData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [kpis, setKpis] = useState(null);
  const [tempStatuses, setTempStatuses] = useState({});
  const [pieChartData, setPieChartData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [followUpKpis, setFollowUpKpis] = useState(null);
  const [activeTab, setActiveTab] = useState("new-patient");
  const [now, setNow] = useState(Date.now());
  const [showReschedule, setShowReschedule] = useState(false);
  const [reschedulePatientId, setReschedulePatientId] = useState(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [selectedFollowUpId, setSelectedFollowUpId] = useState(null);
  const [followUpDate, setFollowUpDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);



  // Persist the follow-up schedule locally so it survives reloads
  const persistNextFollowUp = (appointmentId, value) => {
    if (!appointmentId) return;

    const stored = JSON.parse(localStorage.getItem("nextFollowUps")) || {};

    if (value) {
      stored[appointmentId] = value;
    } else {
      delete stored[appointmentId];
    }

    localStorage.setItem("nextFollowUps", JSON.stringify(stored));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch follow-up data
        const followUpResponse = await fetch(
          `${API_URL}/api/doctor/reports/prescription-follow-ups`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!followUpResponse.ok) {
          throw new Error("Failed to fetch follow-up data");
        }

        const followUpResult = await followUpResponse.json();
        setData(followUpResult.data || []);
        const stats = followUpResult.stats || {};
        setFollowUpKpis(stats);

        const newPatientResponse = await fetch(
          `${API_URL}/api/doctor/dashboard/new-patients`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!newPatientResponse.ok) {
          throw new Error("Failed to fetch new patient data");
        }

        const newPatientResult = await newPatientResponse.json();
        setNewPatientData(newPatientResult.tableData || []);
        // setNewPatientData(dummyTableData);
        setKpis(newPatientResult.kpis || null);
        setPieChartData(newPatientResult.pieChart || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFollowUpCalendarClick = (item) => {
    console.log(item);
    setSelectedFollowUpId(item.appointmentId); // row identify
    setFollowUpDateTime(item.nextFollowUpDate || "");
    setShowFollowUpPicker(true); // popup open
  };

  const handleFollowUpSave = () => {
    if (!selectedFollowUpId || !followUpDateTime) return;

    setNewPatientData((prev) =>
      prev.map((item) =>
        item.appointmentId === selectedFollowUpId
          ? { ...item, nextFollowUpDate: followUpDateTime }
          : item
      )
    );

    setData((prev) =>
      prev.map((item) =>
        item.appointmentId === selectedFollowUpId
          ? { ...item, nextFollowUpDate: followUpDateTime }
          : item
      )
    );

    persistNextFollowUp(selectedFollowUpId, followUpDateTime);

    setShowFollowUpPicker(false);
    setSelectedFollowUpId(null);
    setFollowUpDateTime("");
  };

  useEffect(() => {
    if (!newPatientData.length) return;

    const stored = JSON.parse(localStorage.getItem("nextFollowUps")) || {};

    setNewPatientData((prev) => {
      let shouldUpdate = false;

      const mapped = prev.map((item) => {
        if (
          stored[item.appointmentId] &&
          item.nextFollowUpDate !== stored[item.appointmentId]
        ) {
          shouldUpdate = true;
          return { ...item, nextFollowUpDate: stored[item.appointmentId] };
        }
        return item;
      });

      return shouldUpdate ? mapped : prev;
    });
  }, [newPatientData.length]);

  useEffect(() => {
    if (!data.length) return;

    const stored = JSON.parse(localStorage.getItem("nextFollowUps")) || {};

    setData((prev) => {
      let shouldUpdate = false;

      const mapped = prev.map((item) => {
        if (
          stored[item.appointmentId] &&
          item.nextFollowUpDate !== stored[item.appointmentId]
        ) {
          shouldUpdate = true;
          return { ...item, nextFollowUpDate: stored[item.appointmentId] };
        }
        return item;
      });

      return shouldUpdate ? mapped : prev;
    });
  }, [data.length]);

  //reshedule storage
  useEffect(() => {
    if (!newPatientData.length) return;

    const stored =
      JSON.parse(localStorage.getItem("rescheduledPatients")) || {};

    setNewPatientData((prev) =>
      prev.map((item) => {
        if (stored[item._id]) {
          return {
            ...item,
            status: "Rescheduled",
            rescheduledTime: stored[item._id],
          };
        }
        return item;
      })
    );
  }, [newPatientData.length]);

  //call attempts
  useEffect(() => {
    if (!newPatientData.length) return;

    const storedCalls = JSON.parse(localStorage.getItem("callAttempts")) || {};

    setNewPatientData((prev) =>
      prev.map((item) => {
        if (storedCalls[item._id]) {
          return {
            ...item,
            lastCallAttempt: storedCalls[item._id].lastCallAttempt,
            callsMade: storedCalls[item._id].callsMade,
            isTimerStopped: storedCalls[item._id].timerPaused,
            postCallTimerStart: storedCalls[item._id].postCallTimerStart,
          };
        }
        return item;
      })
    );
  }, [newPatientData.length]);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);



  const handleStatusSelect = (patientId, newStatus) => {
    if (newStatus === "Rescheduled") {
      setReschedulePatientId(patientId);
      setShowReschedule(true);
      return;
    }

    setTempStatuses((prev) => ({
      ...prev,
      [patientId]: newStatus,
    }));
  };
  const handleStatusSave = async (patientId) => {
    const newStatus = tempStatuses[patientId];

    try {
      // 🔹 Backend status update
      const response = await fetch(`${API_URL}/api/doctor/update-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ patientId, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // 🔹 Update React state
      setNewPatientData((prev) =>
        prev.map((item) =>
          item._id === patientId ? { ...item, status: newStatus } : item
        )
      );

      // 🔹 Persist LOST status for refresh (state management)
      if (newStatus === "Lost") {
        const storedLost =
          JSON.parse(localStorage.getItem("lostPatients")) || {};
        storedLost[patientId] = true;
        localStorage.setItem("lostPatients", JSON.stringify(storedLost));
      }

      // 🔹 Clear temp status
      setTempStatuses((prev) => {
        const updated = { ...prev };
        delete updated[patientId];
        return updated;
      });

      console.log("Status updated successfully");
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handlePatientClick = (patientId) => {
    setSelectedPatientId(patientId);
    setShowPopup(true);
    fetchPatientDetails(patientId);
  };

  const makeCall = async (patient) => {
    try {
      const token = localStorage.getItem("token"); // if using JWT

      const response = await axios.post(
        `${API_URL}/api/call/call-patient`,
        {
          patientId: patient.patientId 
        },
        {
          headers: {
            Authorization: `Bearer ${token}` // remove if not required
          }
        }
      );

      if (response.status === 200) {
        window.alert("Call initiated successfully!");

        // OPTIONAL: Increment call count locally
        setPatients(prevPatients =>
          prevPatients.map(p =>
            p._id === patient._id
              ? {
                ...p,
                medicalDetails: {
                  ...p.medicalDetails,
                  callCount: (p.medicalDetails.callCount || 0) + 1
                }
              }
              : p
          )
        );

      }

    } catch (error) {
      console.error("Error initiating call:", error.response?.data || error.message);
      window.alert(error.response?.data?.message || "Call failed");
    }
  };
  const handleRescheduleSave = () => {
    if (!rescheduleDateTime || !reschedulePatientId) return;

    // ✅ Update React state
    setNewPatientData((prev) =>
      prev.map((item) =>
        item._id === reschedulePatientId
          ? {
            ...item,
            status: "Rescheduled",
            rescheduledTime: rescheduleDateTime,
          }
          : item
      )
    );

    // ✅ Save to localStorage
    const stored =
      JSON.parse(localStorage.getItem("rescheduledPatients")) || {};
    stored[reschedulePatientId] = rescheduleDateTime;
    localStorage.setItem("rescheduledPatients", JSON.stringify(stored));

    setShowReschedule(false);
    setRescheduleDateTime("");
    setReschedulePatientId(null);
  };

  const handleCallClick = (patientId) => {
    const nowTime = new Date().toISOString();
    const nowMs = Date.now();

    setNewPatientData((prev) =>
      prev.map((item) => {
        if (item._id !== patientId) return item;

        const updatedCalls = Number(item.callsMade || 0) + 1;

        const slaTime = getSLATime(item);
        const diff = slaTime ? new Date(slaTime).getTime() - nowMs : 0;

        let frozenTime = "00:00";
        if (diff > 0) {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          frozenTime = `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
        }

        // Save to localStorage
        const stored = JSON.parse(localStorage.getItem("callAttempts")) || {};
        stored[patientId] = {
          lastCallAttempt: nowTime,
          callsMade: updatedCalls,
          isTimerStopped: true,
          postCallTimerStart: nowMs,
          showPendingAfterCall: null,
          callStoppedAt: nowMs,
          frozenTimeLeft: frozenTime,
        };
        localStorage.setItem("callAttempts", JSON.stringify(stored));

        return {
          ...item,
          lastCallAttempt: nowTime,
          callsMade: updatedCalls,
          status: "Pending",

          // 🔒 TIMER CONTROL
          isTimerStopped: true,
          isTimerFrozen: true,
          frozenTimeLeft: frozenTime,

          postCallTimerStart: nowMs,
          callStoppedAt: nowMs,
          showPendingAfterCall: null,
          disableAutoOverdue: true,
        };
      })
    );
  };

  //filtered data create
  // const filteredPatients = newPatientData.filter((item) => {
  //   if (activeFilter === "All")
  //     return item.status !== "Lost" && item.status !== "Completed";
  //   if (activeFilter === "Lost") return item.status === "Lost";
  //   if (activeFilter === "Completed") return item.status === "Completed";
  //   return item.status === activeFilter;
  // });

  const formatDate = (dateString) => {
    if (!dateString) return "--";

    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "short" });
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");

    return `${day} ${month}, ${hour}:${minute}`;
  };

  const formatAppointmentDate = (dateString, timeSlot) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",

    });
    return timeSlot ? `${dateStr}, ${timeSlot}` : dateStr;
  };



  // Filter data based on search term
  const filteredData = data.filter(
    (item) =>
      item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientUniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter new patient data based on search term
  const filteredNewPatientData = newPatientData.filter((item) => {
    // 🔍 search filter
    const matchesSearch =
      item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    // 🎯 status filter
    let matchesStatus = true;
    if (activeFilter === "All") {
      matchesStatus = item.status !== "Lost" && item.status !== "Completed";
    } else {
      matchesStatus = item.status === activeFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // Pagination logic for follow-up
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  // Pagination logic for new patients
  const currentNewPatientData = filteredNewPatientData.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalNewPatientPages = Math.ceil(
    filteredNewPatientData.length / entriesPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getSLATime = (item) => {
    let baseTime;

    if (item.isInCallWindow && item.callWindowStart) {
      baseTime = item.callWindowStart; // 👈 after call
    } else if (item.status === "Rescheduled" && item.rescheduledTime !== "-") {
      baseTime = item.rescheduledTime;
    } else {
      baseTime = item.registrationTime;
    }

    if (!baseTime) return null;

    const t = new Date(baseTime);
    t.setMinutes(t.getMinutes() + 5);
    return t;
  };

  // final over due
  const getFinalOverdueTime = (item) => {
    const baseTime =
      item.status === "Rescheduled" && item.rescheduledTime !== "-"
        ? item.rescheduledTime
        : item.registrationTime;

    if (!baseTime) return null;

    const time = new Date(baseTime);
    time.setMinutes(time.getMinutes() + 10); // 5 mins SLA + 5 mins grace
    return time.getTime();
  };

  const calculateTimeLeft = (item, slaTime, finalOverdueTime) => {
    const now = Date.now();

    // 🟦 1. RESCHEDULE OVERRIDE
    if (
      item.status === "Rescheduled" &&
      item.rescheduledTime &&
      now < new Date(item.rescheduledTime).getTime()
    ) {
      return "Pending";
    }

    if (item.isTimerFrozen && item.frozenTimeLeft) {
      return item.frozenTimeLeft;
    }

    // 🟨 2. POST-CALL STOP WINDOW (FIXED)
    if (item.isTimerStopped) {
      // First 5 mins after call
      if (!item.showPendingAfterCall) {
        return "Stopped";
      }

      // After 5 mins
      return "Pending";
    }

    // 🟩 3. NORMAL SLA COUNTDOWN
    if (!slaTime) return "--";

    const slaEnd = new Date(slaTime).getTime();

    if (now <= slaEnd) {
      const diff = slaEnd - now;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    // ⏳ Grace period
    if (finalOverdueTime && now <= finalOverdueTime) {
      const diff = finalOverdueTime - now;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return `-${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    return "Overdue";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNewPatientData((prev) =>
        prev.map((item) => {
          const finalOverdueTime = getFinalOverdueTime(item);

          if (
            item.status === "Pending" &&
            finalOverdueTime &&
            Date.now() > finalOverdueTime &&
            !item.isTimerStopped &&
            !item.disableAutoOverdue
          ) {
            return { ...item, status: "Pending" };
          }

          return item;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewPatientData((prev) =>
        prev.map((item) => {
          if (!item.isTimerStopped || !item.postCallTimerStart) return item;

          const resumeEnd = item.postCallTimerStart + 5 * 60 * 1000;

          if (Date.now() > resumeEnd) {
            return {
              ...item,
              isTimerStopped: false,
              status: "Pending",
            };
          }

          return item;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now()); // 👈 re-render trigger
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isSLAOver = (item) => {
    const finalOverdueTime = getFinalOverdueTime(item);
    if (!finalOverdueTime) return false;

    return new Date() > new Date(finalOverdueTime);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNewPatientData((prev) =>
        prev.map((item) => {
          if (item.status === "Pending" && isSLAOver(item)) {
            return { ...item, status: "Overdue" };
          }
          return item;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DoctorLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading data...</p>
            </div>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-7">
        <div className="bg-white rounded-xl shadow-lg p-6 ">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* New Patient Tab Content */}
          {activeTab === "new-patient" && (
            <>
              {/* Header */}
              <div className="mb-6 ">
                {/* KPI Cards and Pie Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-16 mt-8 pl-[20px] pr-[20px] ">
                  {/* KPI Cards */}
                  <div
                    className="bg-white  rounded-xl shadow-lg px-6 h-9px py-2 pb-2 pl-[20px] border border-blue-100 "
                    style={{
                      boxShadow: `
      0 -3px 5px rgba(59, 130, 246, 0),   /* Top glow (subtle) */
      -3px 0 5px rgba(59, 130, 246, 0.1),   /* Left glow (subtle) */
      0 6px 16px rgba(59, 130, 246, 0.2),   /* Bottom glow (stronger) */
      6px 0 16px rgba(59, 130, 246, 0.2)    /* Right glow (stronger) */
    `,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3 pt-4">
                      <div className="w-8 h-0 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 ">
                        New Patient KPI
                      </h3>
                    </div>
                    <div className="h-2"></div>

                    {kpis && (
                      <div className="grid grid-cols-3 gap-3 mb-2px">
                        <div className="border-l-4 border-blue-500 shadow-lg rounded-lg p-3 pl-3  gap-6 flex items-center justify-between">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Registered
                          </p>
                          <p className="text-2xl font-bold text-blue-500">
                            {kpis.totalRegistered}
                          </p>
                        </div>
                        <div className="border-l-4 border-yellow-500 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between ">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Rescheduled
                          </p>
                          <p className="text-2xl font-bold text-yellow-500">
                            {kpis.rescheduled}
                          </p>
                        </div>
                        <div className="border-l-4 border-red-500 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between ">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Lost
                          </p>
                          <p className="text-2xl font-bold text-red-500 ">
                            {kpis.lost}
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-green-500 ">
                            {kpis.completed}
                          </p>
                        </div>
                        <div className="border-l-4 border-orange-500 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between gap-12">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Overdue
                          </p>
                          <p className="text-2xl font-bold text-orange-500">
                            {kpis.overdue}
                          </p>
                        </div>
                        <div className="border-l-4 border-cyan-500 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between gap-2">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            SLA Completion
                          </p>
                          <p className="text-2xl font-bold text-cyan-600 truncate">
                            {kpis.slaCompletionPercentage}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pie Chart */}
                  <div
                    className="bg-white rounded-xl shadow-lg h-[220px] p-6  border  border-blue-100"
                    style={{
                      boxShadow: `
      0 -3px 5px rgba(59, 130, 246, 0),   /* Top glow (subtle) */
      -3px 0 5px rgba(59, 130, 246, 0.1),   /* Left glow (subtle) */
      0 6px 16px rgba(59, 130, 246, 0.2),   /* Bottom glow (stronger) */
      6px 0 16px rgba(59, 130, 246, 0.2)    /* Right glow (stronger) */
    `,
                    }}
                  >
                    <div className="flex items-center gap-2 ">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Call Attempts Breakdown
                      </h3>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-6 pb-[100px] text-base">
                      <PieChart width={300} height={150}>
                        <Pie
                          data={pieChartData.map((item) => ({
                            name:
                              item._id === null
                                ? "No attempts"
                                : item._id === 0
                                  ? "First attempt"
                                  : item._id === 1
                                    ? "Second attempt"
                                    : "Third attempt",
                            value: item.count,
                          }))}
                          cx="45%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => {
                            const colors = {
                              null: "#ff4e02ff", // gray → No attempts
                              0: "#60A5FA", // yellow → First attempt
                              1: "#34D399", // green → Second attempt
                              2: "#FBBF24", // orange for 3rd
                            };
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={colors[entry._id] || "#9CA3AF"}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip />
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          iconType="circle"
                          wrapperStyle={{
                            paddingLeft: "24px",
                            fontSize: "12px",
                            width: "142px",
                            height: "128px",
                            lineHeight: "2.5",
                          }}
                          content={({ payload }) => (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              {payload?.map((entry, index) => (
                                <li
                                  key={`legend-${index}`}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px", // space between circle and text
                                    marginBottom: "8px", // vertical spacing between items
                                    whiteSpace: "nowrap", // prevent wrapping
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: "12px",
                                      height: "12px",
                                      borderRadius: "50%",
                                      backgroundColor: entry.color,
                                    }}
                                  />
                                  <span
                                    style={{
                                      color: entry.color,
                                      fontSize: "12px",
                                    }}
                                  >
                                    {entry.value}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        />
                      </PieChart>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  {/* Search */}
                  <div className="relative w-40 pl-[20px] ">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-800 w-4 h-4 " />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}

                      className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 text-gray-800 rounded-md
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sort & Status */}
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Open Calendar
                  </button>
                  <div className="absolute right-[70px] flex items-center gap-3 w-30">
                    <div className="relative">
                      <select className="h-9 pl-8 pr-6 w-[110px] text-sm border border-gray-300 rounded-md">
                        <option>Sort</option>
                        <option>Newest</option>
                        <option>Oldest</option>
                      </select>
                      <FaSortAmountDownAlt className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>

                    <div className="relative ">
                      <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="h-9 w-[125px] pl-8 pr-6 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Lost">Lost</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex justify-around  mb-4 mx-2 w-[1500px] shadow-lg overflow-x-auto bg-white">
                <table className="max-w-screen  ">
                  <thead className="bg-white border-b-2  border-blue-200">
                    <tr className=" ">
                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="mr-2 align-middle appearance-none w-5 h-5 border-2 rounded-md border-gray-300 checked:bg-green-500 checked:border-green-500 cursor-pointer"
                        />
                        Patient Name
                      </th>
                      <th className="py-3   px-5 min-w-[180px] text-center text-base font-semibold  text-gray-700 bg-gray-100 whitespace-nowrap">
                        Registration
                        <br />
                        Time
                      </th>
                      <th className="py-3 px-7 min-w-[180px] text-center text-base font-semibold text-gray-700  whitespace-nowrap">
                        SLA Time
                      </th>
                      <th className="py-3 px-6 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Time Left
                      </th>
                      <th className="py-3 px-8 min-w-[180px] text-center text-base font-semibold text-gray-700 whitespace-nowrap">
                        Last Call
                        <br />
                        Attempt
                      </th>
                      <th className="py-3 px-6 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Call
                        <br />
                        Attempts
                      </th>
                      <th className="py-3 px-6 min-w-[180px] text-center text-base font-semibold text-gray-700 whitespace-nowrap">
                        Rescheduled
                        <br />
                        Time
                      </th>
                      <th className="py-3 px-6 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Status
                      </th>
                      <th className="py-3 px-6 min-w-[180px] text-center text-base font-semibold text-gray-700 whitespace-nowrap">
                        Message
                      </th>
                      <th className="py-3 px-6 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Call
                      </th>
                      <th className="py-3 px-6 min-w-[180px] text-center text-base font-semibold text-gray-700 whitespace-nowrap">
                        Appointment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentNewPatientData.length > 0 ? (
                      currentNewPatientData.map((item, idx) => {
                        const slaTime = getSLATime(item);
                        const finalOverdueTime = getFinalOverdueTime(item);
                        const isRescheduleActive =
                          item.status === "Rescheduled" &&
                          item.rescheduledTime &&
                          new Date(item.rescheduledTime).getTime() -
                          15 * 60 * 1000 >
                          Date.now();
                        const isPostCallActive =
                          item.isTimerStopped && item.status !== "Rescheduled";
                        return (
                          <tr
                            key={idx}
                            className="border-b border-blue-200 h-[54px]"
                          >
                            {/* Patient Name */}
                            <td className="bg-white p-4 text-gray-600">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${item.appDownload === 1
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-300"
                                    }`}
                                >
                                  {item.appDownload === 1 && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>

                                <button
                                  onClick={() => handlePatientClick(item._id)}
                                  className="text-black underline hover:text-blue-400 text-sm"
                                >
                                  {item.patientName || "--"}
                                </button>
                              </div>
                            </td>

                            {/* Registration Time */}
                            <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal align-middle">
                              {formatDate(item.registrationTime)}
                            </td>

                            {/* SLA Time */}
                            <td className="bg-white p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal align-middle">
                              {formatDate(slaTime)}
                            </td>

                            {/* Time Left */}
                            <td className="bg-gray-100 p-4 text-center">
                              {item.status === "Rescheduled" ? (
                                // ✅ STOP TIMER – show Rescheduled only
                                <span className="flex items-center justify-center w-[128px] h-[28px] px-3 py-1 rounded-full border-2 border-blue-500 bg-blue-100 text-blue-600 text-xs font-bold">
                                  <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                                  Rescheduled{" "}
                                </span>
                              ) : // ) :item.isTimerStopped ? (
                                //   <span className="stopped-badge">Stopped</span>
                                item.status === "Completed" ? (
                                  <span className="flex items-center justify-center w-[128px] h-[28px] px-3 py-1 rounded-full border-2 border-green-500 bg-green-100 text-green-600 text-xs font-bold">
                                    Completed
                                  </span>
                                ) : item.status === "Lost" ? (
                                  <span
                                    className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 border-2 border-gray-300"
                                  >
                                    --
                                  </span>
                                ) : (
                                  // ✅ NORMAL TIMER (Pending / Overdue)
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${calculateTimeLeft(slaTime) === "Overdue"
                                      ? "bg-green-100 text-green-600 border-2 border-green-400"
                                      : "bg-red-100 text-red-600 border-2 border-red-400"
                                      }`}
                                  >
                                    {calculateTimeLeft(
                                      item,
                                      slaTime,
                                      finalOverdueTime
                                    )}
                                  </span>
                                )}
                            </td>

                            <td className="bg-white p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal align-middle decoration-solid decoration-0 underline-offset-0">
                              {item.lastCallAttempt !== "-"
                                ? formatDate(item.lastCallAttempt)
                                : "--"}
                            </td>
                            <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal align-middle decoration-solid decoration-0 underline-offset-0">
                              {item.callsMade !== "-"
                                ? `${item.callsMade}/3`
                                : "0/3"}
                            </td>
                            <td className="bg-white p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal align-middle">
                              {item.rescheduledTime !== "-"
                                ? formatDate(item.rescheduledTime)
                                : "--"}
                            </td>
                            <td className="bg-gray-100 p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <select
                                  value={
                                    tempStatuses[item._id] ||
                                    item.status ||
                                    "Pending"
                                  }
                                  onChange={(e) =>
                                    handleStatusSelect(item._id, e.target.value)
                                  }
                                  className="px-3 py-1.5 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Rescheduled">
                                    Rescheduled
                                  </option>
                                  <option value="Overdue">Overdue</option>
                                  <option value="Lost">Lost</option>
                                </select>
                                {tempStatuses[item._id] &&
                                  tempStatuses[item._id] !== item.status && (
                                    <button
                                      onClick={() => handleStatusSave(item._id)}
                                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                      <Check className="w-4 h-4" />{" "}
                                    </button>
                                  )}
                              </div>
                            </td>
                            <td className="bg-white p-4 text-center">
                              <button className="px-4 py-1.5 text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600">
                                Message
                              </button>
                            </td>
                            <td className="bg-gray-100 p-4 text-center">
                              <button
                                onClick={() => makeCall(item)} // call the function
                                className="px-4 py-1.5 text-xs font-medium rounded-md bg-green-500 text-white hover:bg-green-600"
                              >
                                Call
                              </button>
                            </td>
                            <td className="bg-white p-4 text-center">
                              <button
                                onClick={() =>
                                  navigate(`/doctor/${item._id}/book-appointment`)
                                }
                                className="px-4 py-1.5 text-xs font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600"
                              >
                                Book Appointment
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={15}
                          className="bg-white text-center text-gray-500 py-6"
                        >
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600">
                    Show{" "}
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md p-2 mx-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>{" "}
                    entries per page
                  </label>
                  <span className="text-sm text-gray-600">
                    Showing {indexOfFirstEntry + 1} to{" "}
                    {Math.min(indexOfLastEntry, filteredNewPatientData.length)}{" "}
                    of {filteredNewPatientData.length} entries
                  </span>
                </div>

                <div className="flex gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md ${currentPage === 1
                      ? "bg-gray-100 cursor-not-allowed"
                      : "hover:bg-blue-200"
                      }`}
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, totalNewPatientPages))].map(
                    (_, index) => {
                      let pageNum;
                      if (totalNewPatientPages <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= totalNewPatientPages - 2) {
                        pageNum = totalNewPatientPages - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }

                      if (pageNum > 0 && pageNum <= totalNewPatientPages) {
                        return (
                          <button
                            key={index}
                            onClick={() => paginate(pageNum)}
                            className={`px-3 py-1 border rounded-md ${currentPage === pageNum
                              ? "bg-blue-300"
                              : "hover:bg-blue-200"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    }
                  )}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalNewPatientPages}
                    className={`px-3 py-1 border rounded-md ${currentPage === totalNewPatientPages
                      ? "bg-gray-100 cursor-not-allowed"
                      : "hover:bg-blue-200"
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Patient Follow-Up Tab Content */}
          {activeTab === "follow-up" && (
            <>
              {/* Header */}
              <div className="mb-6">
                {/* KPI Cards - Add this after the search section and before the table */}
                <div className="max-w-3xl mb-0 w-[550px] h-[280px] pl-[20px] mt-8 ">
                  <div
                    className="bg-white rounded-xl w-[500px]  shadow-lg p-6 border border-blue-100"
                    style={{
                      boxShadow: `
      0 -3px 5px rgba(59, 130, 246, 0),   /* Top glow (subtle) */
      -3px 0 5px rgba(59, 130, 246, 0.1),   /* Left glow (subtle) */
      0 6px 16px rgba(59, 130, 246, 0.2),   /* Bottom glow (stronger) */
      6px 0 16px rgba(59, 130, 246, 0.2)    /* Right glow (stronger) */
    `,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1 mt-1">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 ">
                        Follow-Up Status
                      </h3>
                    </div>
                    <div className="h-4"></div>

                    {followUpKpis && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border-l-4 border-blue-500 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Pending
                          </p>
                          <p className="text-2xl font-bold text-blue-500">
                            {followUpKpis.pending}
                          </p>
                        </div>
                        <div className="border-l-4 border-orange-500 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Rescheduled
                          </p>
                          <p className="text-2xl font-bold text-orange-500">
                            {followUpKpis.rescheduled}
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Completed
                          </p>
                          <p className="text-2xl font-bold text-green-500">
                            {followUpKpis.completed}
                          </p>
                        </div>
                        <div className="border-l-4 border-cyan-400 shadow-lg rounded-lg p-3 pl-3 flex items-center justify-between">
                          <p className="text-[14px] font-medium leading-none tracking-normal">
                            Completion Rate
                          </p>
                          <p className="text-2xl font-bold text-cyan-600">
                            {followUpKpis.completionRate}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4 pr-6 ">
                  <div className="flex flex-wrap gap-4 items-center pl-6">
                    <div className="relative w-40">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 text-gray-800 rounded-md
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-30">
                    <div className="relative">
                      <select className="h-9 pl-8 pr-6 w-[110px] text-sm border border-gray-300 rounded-md">
                        <option>Sort</option>
                        <option>Newest</option>
                        <option>Oldest</option>
                      </select>
                      <FaSortAmountDownAlt className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>

                    <div className="relative ">
                      <select className="h-9 w-[125px] pl-8 pr-6 text-sm border border-gray-300 rounded-md ">
                        <option>Status</option>
                        <option>Pending</option>
                        <option>Rescheduled</option>
                        <option>Follow-up</option>
                      </select>
                      <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex justify-around  mb-4 mx-2 w-[1500px] min-h-[400px] shadow-lg overflow-x-auto bg-white">
                <table className="w-full overflow-hidden rounded-lg ">
                  <thead>
                    <tr className="border-b border-blue-200 w-[150px]">
                      <th className="py-3 px-4 min-w-[180px] text-center  text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Patient Name
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center  text-base font-semibold text-gray-700 bg-white whitespace-nowrap">
                        Prescription
                      </th>

                      {/* Appointment Date – two lines */}
                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100">
                        <span className="block">Appointment</span>
                        <span className="block ">Date</span>
                      </th>

                      {/* Total Follow-ups – two lines */}
                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-white">
                        <span className="block">TotalFollow-</span>
                        <span className="block">ups</span>
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Completed
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-white whitespace-nowrap">
                        Left
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Last Follow-up
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-white whitespace-nowrap">
                        Next Follow-up
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Remarks
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-lg font-semibold text-gray-700 bg-white whitespace-nowrap">
                        Status
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        Message
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-white whitespace-nowrap">
                        Call
                      </th>

                      <th className="py-3 px-4 min-w-[180px] text-center text-base font-semibold text-gray-700 bg-gray-100 whitespace-nowrap">
                        <span className="block">Schedule</span>
                        <span className="block">Follow-Up</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((item, idx) => (
                        <tr key={idx} className="border-b border-blue-200">
                          <td className="bg-gray-100 p-4 text-gray-600 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  console.log("item", item);
                                  handleFollowUpCalendarClick(item);
                                }}
                                className="text-black-800 underline hover:text-blue-400 cursor-pointer text-left text-sm font-medium leading-[26.76px] tracking-normal  align-middle decoration-solid decoration-0 underline-offset-0"
                              >
                                {item.patientName || "--"}
                              </button>
                            </div>
                          </td>
                          <td className="bg-white p-4 text-center ">
                            <button className="inline-flex items-center px-3 py-1.5 gap-2 text-sm font-medium rounded-md text-black bg-blue-50 hover:bg-blue-100 border border-blue-200">
                              <FiEye className="text-[#131B7A] text-base" />
                              View
                            </button>
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal  align-middle decoration-solid decoration-0 underline-offset-0">
                            {formatAppointmentDate(
                              item.appointmentDate,
                              item.timeSlot
                            )}
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal  align-middle decoration-solid decoration-0 underline-offset-0">
                            {item.totalFollowUpsScheduled || 0}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal  align-middle decoration-solid decoration-0 underline-offset-0">
                            {item.completedFollowUps || 0}
                          </td>
                          <td className="bg-white p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal  align-middle decoration-solid decoration-0 underline-offset-0">
                            {item.missedFollowUps || 0}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal  align-middle decoration-solid decoration-0 underline-offset-0">
                            {formatDate(item.lastFollowUpDate)}
                          </td>
                          <td className="bg-white p-4 text-center text-sm">
                            {formatDate(item.nextFollowUpDate)}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-600 text-center text-sm font-normal leading-[26.76px] tracking-normal  align-middle decoration-solid decoration-0 underline-offset-0">
                            {item.lastFollowUpRemarks || "--"}
                          </td>
                          <td className="bg-white p-4 text-center">
                            <select className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50">
                              <option>
                                {item.lastFollowUpStatus || "Pending"}
                              </option>
                              <option>Completed</option>
                              <option>Rescheduled</option>
                            </select>
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <button className="px-4 py-1.5 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600">
                              Message
                            </button>
                          </td>
                          <td className="bg-white p-4 text-center">
                            <button className="px-4 py-1.5 text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600
                            "  onClick={() => makeCall(item)}>
                              Call

                            </button>
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                console.log("item", item);
                                setSelectedFollowUpId(item.appointmentId);
                                setFollowUpDateTime(
                                  item.nextFollowUpDate || ""
                                );
                                setShowFollowUpPicker(true);
                              }}
                              className="p-2 hover:bg-gray-200 rounded-md"
                            >
                              <Calendar />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={15}
                          className="bg-white text-center text-gray-500 py-6"
                        >
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap justify-between items-center mt-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-600">
                    Show{" "}
                    <select
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md p-2 mx-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>{" "}
                    entries per page
                  </label>
                  <span className="text-sm text-gray-600">
                    Showing {indexOfFirstEntry + 1} to{" "}
                    {Math.min(indexOfLastEntry, filteredData.length)} of{" "}
                    {filteredData.length} entries
                  </span>
                </div>

                <div className="flex gap-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md ${currentPage === 1
                      ? "bg-gray-100 cursor-not-allowed"
                      : "hover:bg-blue-200"
                      }`}
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <button
                          key={index}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 border rounded-md ${currentPage === pageNum
                            ? "bg-blue-300"
                            : "hover:bg-blue-200"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded-md ${currentPage === totalPages
                      ? "bg-gray-100 cursor-not-allowed"
                      : "hover:bg-blue-200"
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Patient Details Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Patient Details
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : patientDetails ? (
              <div className="p-6">
                {/* Profile Section */}
                <div className="border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {patientDetails.profile.patientName}
                      </h3>
                      <p className="text-gray-600">
                        {patientDetails.profile.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-semibold">Age:</span>{" "}
                        {patientDetails?.profile?.age || "-"}{" "}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Gender:</span>{" "}
                        {patientDetails.profile.gender}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Email:</span>{" "}
                        {patientDetails.profile.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-semibold">Address:</span>{" "}
                        {patientDetails.profile.address}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Symptoms:</span>{" "}
                        {patientDetails.profile.diseaseName}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Source:</span>{" "}
                        {patientDetails.profile.source}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient History Table */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Patient History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-blue-200">
                          <th className="bg-white text-left p-3 font-bold text-gray-700 text-sm">
                            S.No
                          </th>
                          <th className="bg-gray-100 text-left p-3 font-bold text-gray-700 text-sm">
                            Date & Time
                          </th>
                          <th className="bg-white text-left p-3 font-bold text-gray-700 text-sm">
                            Mode
                          </th>
                          <th className="bg-gray-100 text-left p-3 font-bold text-gray-700 text-sm">
                            Call Recording
                          </th>
                          <th className="bg-white text-left p-3 font-bold text-gray-700 text-sm">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientDetails.logs &&
                          patientDetails.logs.length > 0 ? (
                          patientDetails.logs.map((log, idx) => (
                            <tr key={idx} className="border-b border-blue-200">
                              <td className="bg-white p-3 text-gray-600 text-sm">
                                {idx + 1}
                              </td>
                              <td className="bg-gray-100 p-3 text-gray-600 text-sm">
                                {formatDate(log.timestamp)}
                              </td>
                              <td className="bg-white p-3 text-gray-600 text-sm">
                                {log.action}
                              </td>
                              <td className="bg-gray-100 p-3 text-gray-600 text-sm">
                                <PlayCircle />
                              </td>
                              <td className="bg-white p-3 text-gray-600 text-sm">
                                {log.note}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="bg-white text-center text-gray-500 py-6"
                            >
                              No history found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Failed to load patient details
              </div>
            )}
          </div>
        </div>
      )}

      {showReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[320px]">
            <h3 className="text-lg font-semibold mb-4">Reschedule Follow-up</h3>

            <input
              type="datetime-local"
              value={rescheduleDateTime}
              onChange={(e) => setRescheduleDateTime(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReschedule(false);
                  setRescheduleDateTime("");
                }}
                className="px-4 py-1.5 border rounded"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRescheduleSave}
                className="px-4 py-1.5 bg-blue-500 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showFollowUpPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Schedule Follow-up</h3>
              <p className="text-blue-100 text-sm mt-1">Set a reminder for this lead</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={followUpDateTime}
                    onChange={(e) => setFollowUpDateTime(e.target.value)}
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quick Select Options */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    setFollowUpDateTime(tomorrow.toISOString().slice(0, 16));
                  }}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Tomorrow 9AM
                </button>
                <button
                  onClick={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    nextWeek.setHours(9, 0, 0, 0);
                    setFollowUpDateTime(nextWeek.toISOString().slice(0, 16));
                  }}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Next Week
                </button>
                <button
                  onClick={() => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    nextMonth.setHours(9, 0, 0, 0);
                    setFollowUpDateTime(nextMonth.toISOString().slice(0, 16));
                  }}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Next Month
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFollowUpPicker(false);
                  setFollowUpDateTime("");
                  setSelectedFollowUpId(null);
                }}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleFollowUpSave}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {isCalendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setIsCalendarOpen(false)} // Close on backdrop click
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-semibold">Medicine Calendar</h2>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>
            </div>
            <MedicineCalendar />
          </div>
        </div>
      )}
    </DoctorLayout>
  );
};

export default FeedbackFollowUp;
