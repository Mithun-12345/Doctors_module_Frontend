// import React, { useEffect, useState } from 'react';
// import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
// import axios from 'axios';
// import config from '/src/config.js';
// import UpcomingAppointments from "./UpcomingAppointments";
// import { Calendar, Clock, User, Video, AlertCircle } from 'lucide-react';



// const AppointmentList = () => {
//   const API_URL = config.API_URL;
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [appointmentsPerPage] = useState(10); // Number of appointments per page
//   const [activeTab, setActiveTab] = useState("today");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [filterDisease, setFilterDisease] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
  


//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         const token = localStorage.getItem('token'); 
//         const response = await axios.get(
//           `${API_URL}/api/doctor/appointments`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           }
//         );
        
//         // Handle the API response structure
//         if (response.data.success && response.data.appointments) {
//           setAppointments(response.data.appointments);
//         } else {
//           setAppointments(response.data || []);
//         }
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching appointments:', err);
//         setError('Failed to fetch appointments');
//         setLoading(false);
//       }
//     };

//     fetchAppointments();
//   }, [API_URL]);

//   // Calculate the range of appointments to display
//   const indexOfLastAppointment = currentPage * appointmentsPerPage;
//   const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
//   const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
 
//   const filteredAppointments = currentAppointments.filter((a) => {
//   const matchesSearch =
//     a.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     a.patient?.phone?.includes(searchTerm);

//   const matchesDate = filterDate
//     ? formatDate(a.appointmentDate) === formatDate(filterDate)
//     : true;

//   const matchesDisease = filterDisease
//     ? a.diseaseType?.name === filterDisease
//     : true;

//   const matchesStatus = filterStatus
//     ? a.status === filterStatus
//     : true;

//   return matchesSearch && matchesDate && matchesDisease && matchesStatus;
// });

//   // Change page
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   // Format date helper
//   const formatDate = (dateString) => {
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch {
//       return 'N/A';
//     }
//   };

//   // Status badge component
//   const StatusBadge = ({ status }) => {
//     const getStatusColor = (status) => {
//       switch (status?.toLowerCase()) {
//         case 'confirmed':
//           return 'bg-green-100 text-green-800';
//         case 'pending':
//           return 'bg-yellow-100 text-yellow-800';
//         case 'cancelled':
//           return 'bg-red-100 text-red-800';
//         case 'completed':
//           return 'bg-blue-100 text-blue-800';
//         default:
//           return 'bg-gray-100 text-gray-800';
//       }
//     };

//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
//         {status || 'N/A'}
//       </span>
//     );
//   };

//   //upcomming appoinment 
//   useEffect(() => {
//     const fetchUpcomingAppointments = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');
        
//         if (!token) {
//           setError('No authentication token found');
//           setLoading(false);
//           return;
//         }
  
//         const response = await fetch(`${API_URL}/api/analytics/upcoming-appointments`, {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });
  
//         if (!response.ok) {
//           throw new Error('Failed to fetch appointments');
//         }
  
//         const result = await response.json();
        
//         if (result.success) {
//           setAppointments(result.data);
//         } else {
//           setError('Failed to load appointments');
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//       fetchUpcomingAppointments();
//     }, [API_URL]);
  
//     // const fetchAppointments = async () => {
//     //   try {
//     //     setLoading(true);
//     //     const token = localStorage.getItem('token');
        
//     //     if (!token) {
//     //       setError('No authentication token found');
//     //       setLoading(false);
//     //       return;
//     //     }
  
//     //     const response = await fetch(`${API_URL}/api/analytics/upcoming-appointments`, {
//     //       method: 'GET',
//     //       headers: {
//     //         'Authorization': `Bearer ${token}`,
//     //         'Content-Type': 'application/json'
//     //       }
//     //     });
  
//     //     if (!response.ok) {
//     //       throw new Error('Failed to fetch appointments');
//     //     }
  
//     //     const result = await response.json();
        
//     //     if (result.success) {
//     //       setAppointments(result.data);
//     //     } else {
//     //       setError('Failed to load appointments');
//     //     }
//     //   } catch (err) {
//     //     setError(err.message);
//     //   } finally {
//     //     setLoading(false);
//     //   }
//     // };
  
//     // const formatDate = (dateString) => {
//     //   const date = new Date(dateString);
//     //   const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
//     //   return date.toLocaleDateString('en-US', options);
//     // };
  
//     const formatTime = (timeSlot) => {
//       const [hours, minutes] = timeSlot.split(':');
//       const hour = parseInt(hours);
//       const ampm = hour >= 12 ? 'PM' : 'AM';
//       const displayHour = hour % 12 || 12;
//       return `${displayHour}:${minutes} ${ampm}`;
//     };
  
//     const handleJoinMeet = (meetLink) => {
//       window.open(meetLink, '_blank');
//     };
  
 


//   if (loading) {
//     return (
//       <DoctorLayout>
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//         </div>
//       </DoctorLayout>
//     );
//   }

//   if (error) {
//     return (
//       <DoctorLayout>
//         <div className="text-center text-red-600 p-8">
//           <p className="text-lg">{error}</p>
//         </div>
//       </DoctorLayout>
//     );
//   }

//   const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

//   return (
//     <DoctorLayout>
//       <div className="container mx-auto p-6">
//         <div className="container mx-auto p-6">
//         <div className="bg-white rounded-xl shadow-md p-6">

//           {/* 🔹 Tabs */}
//           <div className="flex gap-6 border-b mb-6">
//             <button
//               onClick={() => setActiveTab("today")}
//               className={`pb-2 font- text-base ${
//                 activeTab === "today"
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-500"
//               }`}
//             >
//               Today’s Appointments
//             </button>

//             <button
//               onClick={() => setActiveTab("upcoming")}
//               className={`pb-2 font-  text-base ${
//                 activeTab === "upcoming"
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-500"
//               }`}
//             >
//               Upcoming Appointments
//             </button>
//           </div>

//           {/* 🔹 Tab Content */}
//           {activeTab === "today" && <>
          
//         <div className="mb-8">
//       <h1 className="text-3xl font-bold text-gray-900">
//         Appointments
//       </h1>
//       <p className="text-gray-600 mt-2">
//         {appointments.length}{" "}
//         {appointments.length === 1 ? "appointment" : "appointments"} Total Apponiments
//       </p>
//     </div>

//         {appointments.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500 text-lg">No appointments found</p>
//           </div>
//         ) : (
//           <>

//           {/* 🔍 FILTER BAR */}
// <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
  
//   {/* Search */}
//   <div className="relative w-full lg:w-64">
//     <input
//       type="text"
//       placeholder="Search"
//       value={searchTerm}
//       onChange={(e) => setSearchTerm(e.target.value)}
//       className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//     />
//     <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
//   </div>

//   {/* Filters */}
//   <div className="flex gap-3 flex-wrap">
    
//     {/* Date */}
//     <input
//       type="date"
//       value={filterDate}
//       onChange={(e) => setFilterDate(e.target.value)}
//       className="border rounded-lg px-3 py-2 text-sm"
//     />

//     {/* Disease */}
//     <select
//       value={filterDisease}
//       onChange={(e) => setFilterDisease(e.target.value)}
//       className="border rounded-lg px-3 py-2 text-sm"
//     >
//       <option value="">Disease Type</option>
//       <option value="Fever">Fever</option>
//       <option value="Cold">Cold</option>
//       <option value="General">General</option>
//     </select>

//     {/* Status */}
//     <select
//       value={filterStatus}
//       onChange={(e) => setFilterStatus(e.target.value)}
//       className="border rounded-lg px-3 py-2 text-sm"
//     >
//       <option value="">Status</option>
//       <option value="New">New</option>
//       <option value="Confirmed">Confirmed</option>
//       <option value="Completed">Completed</option>
//     </select>

//   </div>
// </div>

//             {/* Desktop Table View */}

//   <table className="w-full overflow-hidden rounded-lg">
//   <thead>
//     <tr className="border-b border-blue-200">
//       <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Patient</th>
//       <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Contact</th>
//       <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Date &amp; Time</th>
//       <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Disease Type</th>
//       <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Payment</th>
//       <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Status</th>
//     </tr>
//   </thead>
//   <tbody>
//     {currentAppointments.map((appointment, index) => (
//       <tr
//         key={appointment._id || index}
//         className="border-b border-blue-200 hover:bg-gray-50"
//       >
//         {/* Patient */}
//         <td className="bg-gray-100 p-4 text-center">
//   <div className="flex flex-col items-center gap-1">
//     <div className="text-sm font-medium text-gray-900">
//       {appointment.patient?.name || "N/A"}
//     </div>
//     <div className="text-xs text-gray-500">
//       {appointment.patient?.age || "N/A"} yrs, {appointment.patient?.gender || "N/A"}
//     </div>
//   </div>
// </td>



//         {/* Contact */}
//         <td className="bg-white p-4 text-gray-700 text-center">
//           {appointment.patient?.phone || "N/A"}
//         </td>

//         {/* Date & Time */}
//         <td className="bg-gray-100 p-4 text-gray-700 text-center">
//           <div>{formatDate(appointment.appointmentDate)}</div>
//           <div className="text-xs text-gray-500">
//             {appointment.timeSlot || "N/A"}
//           </div>
//         </td>

//         {/* Disease Type */}
//         <td className="bg-white p-4 text-center">
//           <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
//             {appointment.diseaseType?.name || "N/A"}
//           </span>
//         </td>

//         {/* Payment */}
//         <td className="bg-gray-100 p-4 text-gray-700 text-center">
//           <div>₹{appointment.payment || 0}</div>
//           <div className="text-xs text-gray-500">
//             {appointment.isPaid ? "Paid" : "Unpaid"}
//           </div>
//         </td>

//         {/* Status */}
//         <td className="bg-white p-4 text-center">
//           <StatusBadge status={appointment.status} />
//         </td>
//       </tr>
//     ))}
//   </tbody>
// </table>
//             {/* Mobile Card View */}
//             {/* <div className="lg:hidden space-y-4">
//               {filteredAppointments.map((appointment, index) => (
//                 <div key={appointment._id || index} className="bg-white shadow-md rounded-lg p-4 border">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center">
//                       <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
//                         <span className="text-sm font-medium text-white">
//                           {appointment.patient?.name?.charAt(0) || 'N'}
//                         </span>
//                       </div>
//                       <div className="ml-3">
//                         <h3 className="text-sm font-medium text-gray-900">
//                           {appointment.patient?.name || 'N/A'}
//                         </h3>
//                         <p className="text-xs text-gray-500">
//                           {appointment.patient?.age || 'N/A'} years, {appointment.patient?.gender || 'N/A'}
//                         </p>
//                       </div>
//                     </div>
//                     <StatusBadge status={appointment.status} />
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div>
//                       <span className="font-medium text-gray-600">Date:</span>
//                       <p className="text-gray-900">{formatDate(appointment.appointmentDate)}</p>
//                     </div>
//                     <div>
//                       <span className="font-medium text-gray-600">Time:</span>
//                       <p className="text-gray-900">{appointment.timeSlot || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <span className="font-medium text-gray-600">Phone:</span>
//                       <p className="text-gray-900">{appointment.patient?.phone || 'N/A'}</p>
//                     </div>
//                     <div>
//                       <span className="font-medium text-gray-600">Payment:</span>
//                       <p className="text-gray-900">₹{appointment.payment || 0}</p>
//                     </div>
//                     <div className="col-span-2">
//                       <span className="font-medium text-gray-600">Consulting For:</span>
//                       <p className="text-gray-900">{appointment.consultingFor || appointment.diseaseName || 'N/A'}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div> */}

//             {/* Pagination Controls */}
// {totalPages > 1 && (
//   <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
//     {/* Show per page dropdown */}
//     <div className="flex items-center mb-4 sm:mb-0">
//       <span className="text-sm text-gray-600 mr-2">Show</span>
//       <select 
//         value={appointmentsPerPage} 
//         onChange={(e) => {
//           const newPerPage = parseInt(e.target.value);
//           setAppointmentsPerPage(newPerPage);
//           setCurrentPage(1); // Reset to first page when changing items per page
//         }}
//         className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//       >
//         <option value="5">5</option>
//         <option value="10">10</option>
//         <option value="20">20</option>
//         <option value="50">50</option>
//       </select>
//       <span className="text-sm text-gray-600 ml-2">per page</span>
//     </div>
    
//     {/* Previous/Next pagination */}
//     <div className="flex items-center space-x-2">
//       <button
//         className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//         onClick={() => paginate(currentPage - 1)}
//         disabled={currentPage === 1}
//       >
//         Previous
//       </button>
      
//       <button
//         className="px-4 py-2 border border-gray-300 rounded-md bg-blue-50 text-sm text-blue-600"
//         disabled
//       >
//         {currentPage}
//       </button>
      
//       <button
//         className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//         onClick={() => paginate(currentPage + 1)}
//         disabled={currentPage === totalPages}
//       >
//         Next
//       </button>
//     </div>
//   </div>
// )}
//           </>
//         )}
//       </>}

//       {/* //upcomming appoinments */}
//          {activeTab === "upcoming" && (
//   <>
//     <div className="mb-8">
//       <h1 className="text-3xl font-bold text-gray-900">
//         Upcoming Appointments
//       </h1>
//       <p className="text-gray-600 mt-2">
//         {appointments.length}{" "}
//         {appointments.length === 1 ? "appointment" : "appointments"} scheduled
//       </p>
//     </div>

//     {appointments.length === 0 ? (
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//         <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           No Upcoming Appointments
//         </h3>
//         <p className="text-gray-500">
//           You don't have any appointments scheduled at the moment.
//         </p>
//       </div>
//     ) : (
      
//       <div className="">
//         {/* 🔍 FILTER BAR */}
// <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
  
//   {/* Search */}
//   <div className="relative w-full lg:w-64">
//     <input
//       type="text"
//       placeholder="Search"
//       value={searchTerm}
//       onChange={(e) => setSearchTerm(e.target.value)}
//       className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//     />
//     <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
//   </div>

//   {/* Filters */}
//   <div className="flex gap-3 flex-wrap">
    
//     {/* Date */}
//     <input
//       type="date"
//       value={filterDate}
//       onChange={(e) => setFilterDate(e.target.value)}
//       className="border rounded-lg px-3 py-2 text-sm"
//     />

//     {/* Disease */}
//     <select
//       value={filterDisease}
//       onChange={(e) => setFilterDisease(e.target.value)}
//       className="border rounded-lg px-3 py-2 text-sm"
//     >
//       <option value="">Disease Type</option>
//       <option value="Fever">Fever</option>
//       <option value="Cold">Cold</option>
//       <option value="General">General</option>
//     </select>

//     {/* Status */}
//     <select
//       value={filterStatus}
//       onChange={(e) => setFilterStatus(e.target.value)}
//       className="border rounded-lg px-3 py-2 text-sm"
//     >
//       <option value="">Status</option>
//       <option value="New">New</option>
//       <option value="Confirmed">Confirmed</option>
//       <option value="Completed">Completed</option>
//     </select>

//   </div>
// </div>

//   <table className="w-full overflow-hidden rounded-lg">
//     <thead>
//       <tr className="border-b border-blue-200">
//         <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">S.No</th>
//         <th className="p-4 text-center text-sm font-semibold text-gray-700">Patient</th>
//         <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Contact</th>
//         <th className="p-4 text-center text-sm font-semibold text-gray-700">Date & Time</th>
//         <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Reason for Visit</th>
//         <th className="p-4 text-center text-sm font-semibold text-gray-700">Reschedule</th>
//         <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Join</th>
//       </tr>
//     </thead>

//     <tbody>
//       {currentAppointments.map((appointment, index) => (
//         <tr
//           key={appointment._id}
//           className="border-b border-blue-100 hover:bg-gray-50"
//         >
//           {/* S.No */}
//           <td className="bg-gray-100 p-4 text-center">{index + 1}</td>

//           {/* Patient */}
//           <td className="p-4 text-center">
//             <div className="font-medium text-gray-900">
//               {appointment.patientName}
//             </div>
//             <div className="text-xs text-gray-500">
//               {appointment.age || "N/A"} yrs, {appointment.gender || "N/A"}
//             </div>
//           </td>

//           {/* Contact */}
//           <td className="bg-gray-100 p-4 text-center text-gray-700">
//             {appointment.phone || "N/A"}
//           </td>

//           {/* Date & Time */}
//           <td className="p-4 text-center text-gray-700">
//             <div>{formatDate(appointment.appointmentDate)}</div>
//             <div className="text-xs text-gray-500">
//               {formatTime(appointment.timeSlot)}
//             </div>
//           </td>

//           {/* Reason */}
//           <td className="bg-gray-100 p-4 text-center">
//             <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
//               {appointment.diseaseName && appointment.diseaseName !== "None"
//                 ? appointment.diseaseName
//                 : "General"}
//             </span>
//           </td>

//           {/* Reschedule */}
//           <td className="p-4 text-center">
//             <button className="text-gray-600 hover:text-blue-600">
//               📅
//             </button>
//           </td>

//           {/* Join */}
//           <td className="bg-gray-100 p-4 text-center">
//             <button
//               onClick={() => handleJoinMeet(appointment.meetLink)}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
//             >
//               <Video className="w-4 h-4" />
//             </button>
//           </td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>

//     )}
//   </>
// )}



//         </div>
//       </div>
        
//       </div>
//     </DoctorLayout>
//   );
// };

// export default AppointmentList;


import React, { useEffect, useState } from 'react';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import axios from 'axios';
import config from '/src/config.js';
import { Calendar, Video } from 'lucide-react';

const AppointmentList = () => {
  const API_URL = config.API_URL;
  const [todayAppointments, setTodayAppointments] = useState([]);       // ✅ For "Today" tab
  const [upcomingAppointments, setUpcomingAppointments] = useState([]); // ✅ For "Upcoming" tab
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage, setAppointmentsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterDisease, setFilterDisease] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // 🔁 Reset to page 1 when filters or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterDate, filterDisease, filterStatus, appointmentsPerPage]);

  // 📅 Fetch TODAY appointments
  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/doctor/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success && response.data.appointments) {
          setTodayAppointments(response.data.appointments);
        } else {
          setTodayAppointments(response.data || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching today appointments:', err);
        setError('Failed to fetch appointments');
        setLoading(false);
      }
    };
    fetchTodayAppointments();
  }, [API_URL]);

  // 🔜 Fetch UPCOMING appointments
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }
        const response = await fetch(`${API_URL}/api/analytics/upcoming-appointments`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch upcoming appointments');
        const result = await response.json();
        if (result.success) {
          setUpcomingAppointments(result.data);
        } else {
          setError('Failed to load upcoming appointments');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchUpcomingAppointments();
  }, [API_URL]);

  // 🛠 Helper functions
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (timeSlot) => {
    if (!timeSlot) return "N/A";
    const [hours, minutes] = timeSlot.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleJoinMeet = (meetLink) => {
    if (meetLink) window.open(meetLink.trim(), '_blank');
  };

  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'confirmed': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'completed': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status || 'N/A'}
      </span>
    );
  };

  // 🔍 Choose data based on active tab
const currentTabData = activeTab === "today" ? todayAppointments : upcomingAppointments;

  // 🔍 Apply filters
   const filteredAppointments = currentTabData.filter((a) => {
  // 🔍 SEARCH
  const matchesSearch = searchTerm
  ? (
      (a.patient?.name &&
        a.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.patient?.phone && a.patient.phone.includes(searchTerm)) ||
      (a.patientName &&
        a.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.phone && a.phone.includes(searchTerm))
    )
  : true;


  // 📅 DATE
  const matchesDate = filterDate
    ? new Date(a.appointmentDate).toISOString().split("T")[0] === filterDate
    : true;

  // 🦠 DISEASE
  const matchesDisease = filterDisease
    ? a.diseaseType?.name === filterDisease ||
      a.diseaseName === filterDisease
    : true;

  // 📌 STATUS
  const matchesStatus = filterStatus
    ? a.status?.toLowerCase() === filterStatus.toLowerCase()
    : true;

  return (
    matchesSearch &&
    matchesDate &&
    matchesDisease &&
    matchesStatus
  );
});

  // 📄 Pagination logic
  const indexOfLast = currentPage * appointmentsPerPage;
const indexOfFirst = indexOfLast - appointmentsPerPage;

const currentAppointments =
  filteredAppointments.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(
  filteredAppointments.length / appointmentsPerPage
);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // 🌀 Loading & Error states
  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="text-center text-red-600 p-8">
          <p className="text-lg">{error}</p>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-6">

          {/* 🔹 Tabs */}
          <div className="flex gap-6 border-b mb-6">
            <button
              onClick={() => setActiveTab("today")}
              className={`pb-2 font-medium text-base ${
                activeTab === "today"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Today’s Appointments
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-2 font-medium text-base ${
                activeTab === "upcoming"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Upcoming Appointments
            </button>
          </div>

          {/* 🔹 Today Tab */}
          {activeTab === "today" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600 mt-2">
                  {todayAppointments.length} {todayAppointments.length === 1 ? "appointment" : "appointments"} total
                </p>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No appointments found</p>
                </div>
              ) : (
                <>
                  {/* 🔍 Filter Bar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="relative w-full lg:w-64">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <select
                        value={filterDisease}
                        onChange={(e) => setFilterDisease(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Disease Type</option>
                        <option value="Fever">Fever</option>
                        <option value="Cold">Cold</option>
                        <option value="General">General</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Status</option>
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* 🗂 Table */}
                  <table className="w-full overflow-hidden rounded-lg shadow-lg">
                    <thead>
                      <tr className="border-b border-blue-200">
                        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Patient</th>
                        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Contact</th>
                        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Date & Time</th>
                        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Disease Type</th>
                        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Payment</th>
                        <th className="bg-white text-center p-4 font-bold text-gray-700 text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAppointments.map((appointment, index) => (
                        <tr key={appointment._id || index} className="border-b border-blue-200 hover:bg-gray-50">
                          <td className="bg-gray-100 p-4 text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {appointment.patient?.age || "N/A"} yrs, {appointment.patient?.gender || "N/A"}
                            </div>
                          </td>
                          <td className="bg-white p-4 text-gray-700 text-center">
                            {appointment.patient?.phone || "N/A"}
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-700 text-center">
                            <div>{formatDate(appointment.appointmentDate)}</div>
                            <div className="text-xs text-gray-500">{appointment.timeSlot || "N/A"}</div>
                          </td>
                          <td className="bg-white p-4 text-center">
                            <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {appointment.diseaseType?.name || "N/A"}
                            </span>
                          </td>
                          <td className="bg-gray-100 p-4 text-gray-700 text-center">
                            <div>₹{appointment.payment || 0}</div>
                            <div className="text-xs text-gray-500">{appointment.isPaid ? "Paid" : "Unpaid"}</div>
                          </td>
                          <td className="bg-white p-4 text-center">
                            <StatusBadge status={appointment.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 📄 Pagination */}
                  {totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center mb-4 sm:mb-0">
                        <span className="text-sm text-gray-600 mr-2">Show</span>
                        <select
                          value={appointmentsPerPage}
                          onChange={(e) => {
                            setAppointmentsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                        </select>
                        <span className="text-sm text-gray-600 ml-2">per page</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        <button
                          className="px-4 py-2 border border-gray-300 rounded-md bg-blue-50 text-sm text-blue-600"
                          disabled
                        >
                          {currentPage}
                        </button>
                        <button
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* 🔹 Upcoming Tab */}
          {activeTab === "upcoming" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upcoming Appointments</h1>
                <p className="text-gray-600 mt-2">
                  {upcomingAppointments.length} {upcomingAppointments.length === 1 ? "appointment" : "appointments"} scheduled
                </p>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
                  <p className="text-gray-500">You don't have any appointments scheduled at the moment.</p>
                </div>
              ) : (
                <>
                  {/* 🔍 Filter Bar (same) */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="relative w-full lg:w-64">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                      />
                      <select
                        value={filterDisease}
                        onChange={(e) => setFilterDisease(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Disease Type</option>
                        <option value="Fever">Fever</option>
                        <option value="Cold">Cold</option>
                        <option value="General">General</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Status</option>
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* 🗂 Upcoming Table */}
                  <table className="w-full overflow-hidden rounded-lg">
                    <thead>
                      <tr className="border-b border-blue-200">
                        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">S.No</th>
                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Patient</th>
                        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Contact</th>
                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Date & Time</th>
                        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Reason for Visit</th>
                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Reschedule</th>
                        <th className="bg-gray-100 text-center p-4 font-bold text-gray-700 text-sm">Join</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAppointments.map((appointment, index) => (
                        <tr key={appointment._id} className="border-b border-blue-100 hover:bg-gray-50">
                          <td className="bg-gray-100 p-4 text-center">{index + 1}</td>
                          <td className="p-4 text-center">
                            <div className="font-medium text-gray-900">{appointment.patientName || "N/A"}</div>
                            <div className="text-xs text-gray-500">
                              {appointment.age || "N/A"} yrs, {appointment.gender || "N/A"}
                            </div>
                          </td>
                          <td className="bg-gray-100 p-4 text-center text-gray-700">
                            {appointment.phone || "N/A"}
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            <div>{formatDate(appointment.appointmentDate)}</div>
                            <div className="text-xs text-gray-500">{formatTime(appointment.timeSlot)}</div>
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {appointment.diseaseName && appointment.diseaseName !== "None"
                                ? appointment.diseaseName
                                : "General"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button className="text-gray-600 hover:text-blue-600">📅</button>
                          </td>
                          <td className="bg-gray-100 p-4 text-center">
                            <button
                              onClick={() => handleJoinMeet(appointment.meetLink)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                            >
                              <Video className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 📄 Pagination (same UI) */}
                  {totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center mb-4 sm:mb-0">
                        <span className="text-sm text-gray-600 mr-2">Show</span>
                        <select
                          value={appointmentsPerPage}
                          onChange={(e) => {
                            setAppointmentsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                        </select>
                        <span className="text-sm text-gray-600 ml-2">per page</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        <button
                          className="px-4 py-2 border border-gray-300 rounded-md bg-blue-50 text-sm text-blue-600"
                          disabled
                        >
                          {currentPage}
                        </button>
                        <button
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default AppointmentList;