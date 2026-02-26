import React, { useEffect, useState } from "react";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { useParams, useNavigate } from "react-router-dom";
import config from '/src/config.js';
import axios from 'axios';
import { User } from 'lucide-react';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import MedicineCalendar from "../../components/doctor components/PresTimeSheet";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);
const API_URL = 'https://clinic-backend-jdob.onrender.com';

//tab navigation component 
const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-6 mb-6 ">
      <button
        onClick={() => onTabChange("Consultation in progress")}
        className={`flex-1 px-5 py-3 rounded-lg gap-16 text-base font-medium leading-none transition-colors ${
          activeTab === "Consultation in progress"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-700 border border-gray-300"
        }`}
      >
        Consultation in progress
      </button>
      <button
        onClick={() => onTabChange("Past / Completed Consultation")}
        className={`flex-1 px-6 py-3 rounded-lg text-base font-medium leading-none transition-colors ${
          activeTab === "Past / Completed Consultation"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-700 border border-gray-300"
        }`}
      >
        Past / Completed Consultation
      </button>
    </div>
  );
};

const ViewDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const [patientDetails, setPatientDetails] = useState({});
  const [activeTab, setActiveTab] = useState("Consultation in progress");
  const [appointmentData, setAppointmentData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [medicineData, setMedicineData] = useState([]);
  const [popupLoading, setPopupLoading] = useState(false);
  const [paymentData, setPaymentData] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [shipmentData, setShipmentData] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [patientCareData, setPatientCareData] = useState(null);
  const [patientCareLoading, setPatientCareLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [openTimesheet, setOpenTimesheet] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showInventoryPopup, setShowInventoryPopup] = useState(false);


// this is what connects page 1 → page 2


//fetch consultation page 
// useEffect(() => {
//   fetchConsultations();
// }, []);
// const fetchConsultations = async () => {
//   try {
//     setLoadingConsultations(true);

//     const res = await fetch(
//       `${API_URL}/api/doctor/history/${selectedAppointmentId}`
//     );
//     const data = await res.json();

//     // ONLY consultation in progress
//     const inProgress = data.appointments.filter(
//       (item) => item.status === "New" || item.status === "In Progress"
//     );

//     setConsultations(inProgress);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     setLoadingConsultations(false);
//   }
// };

//   // Fetch patient details
//   useEffect(() => {
//     const fetchDetails = async () => {
//       if (!id) return;
      
//       const token = localStorage.getItem('token');
//       try {
//         const response = await axios.get(`${API_URL}/api/patient/patientById/${id}`, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         setPatientDetails(response.data);
//       } catch (error) {
//         console.error('Error fetching patient details:', error);
//       }
//     };
//     fetchDetails();
//   }, [id]);

useEffect(() => {
  const fetchPatientAndConsultations = async () => {
    if (!id) return;

    try {
      setLoadingConsultations(true);
      const token = localStorage.getItem("token");

      const [patientRes, consultationRes] = await Promise.all([
        axios.get(`${API_URL}/api/patient/patientById/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/doctor/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // 🔹 Merge patient data from BOTH APIs
      setPatientDetails({
        ...patientRes.data,                     // age, gender, email, etc
        address: consultationRes.data.patientDetails?.address,  // 👈 from 2nd API
        source: consultationRes.data.patientDetails?.source,
        lastVisit: consultationRes.patientDetails?.data.lastVisit,
        TotalPayment: consultationRes.data.patientDetails?.payments,
      });

      // 🔹 Consultation filter
      const inProgress = consultationRes.data.appointments.filter(
        (item) =>
          item.status &&
          ["new", "in progress"].includes(item.status.toLowerCase())
      );

      setConsultations(inProgress);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingConsultations(false);
    }
  };

  fetchPatientAndConsultations();
}, [id]);


const inProgressConsultations = consultations.filter(
  (item) => item.status === "New" || item.status === "In Progress"
);

const completedConsultations = consultations.filter(
  (item) => item.status === "Completed" || item.status === "Closed"
);


  //prescription details
useEffect(() => {
    console.log("useEffect triggered, appointmentId =", appointmentId);

  if (!appointmentId) return;

  const fetchAppointmentDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/doctor/appointment/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointmentData({
        appointmentId: res.data.appointmentId,
        appointmentUniqueId: res.data.appointmentUniqueId,
        totalPrescriptions: res.data.totalPrescriptions,
        statusCounts: res.data.statusCounts,
      });
      setPrescriptions(res.data.prescriptions);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  fetchAppointmentDetails();
}, [appointmentId]);




//   //patient medicine preparation
//   useEffect(() => {
//   if (popupType === "medicine" && selectedPrescription) {
//     console.log(
//       "Sending prescriptionId:",
//       selectedPrescription.prescriptionId
//     );

//     // 🔴 TEMP: Use dummy data instead of API
//     setPopupLoading(true);

//     setTimeout(() => {
//       setMedicineData(dummyMedicinePreparations);
//       setPopupLoading(false);
//     }, 800);
//   }
// }, [popupType, selectedPrescription]);

  useEffect(() => {
  if (popupType === "medicine" && selectedPrescription) {
    fetchMedicinePreparation();
  }
}, [popupType, selectedPrescription]);

const fetchMedicinePreparation = async () => {
  try {
    setPopupLoading(true);

    const res = await fetch(
      `${API_URL}/api/medicine-summary/summaries`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prescriptionIds: [selectedPrescription.prescriptionId],
        }),
      }
    );

    const data = await res.json();
    setMedicineData(data[0]?.medicinePreparations || []);
  } catch (err) {
    console.error(err);
  } finally {
    setPopupLoading(false);
  }
};


//shipment data 
const dummyShipmentData = {
  shipmentId: "467e8dheudnj",
  status: "In Transit",
  partner: "Amazon",
  createdOn: "2025-11-20",
  shippingDate: "2025-11-20",
  arrivalDate: "2025-11-25",
};

useEffect(() => {
  if (popupType === "shipment") {
    setShipmentLoading(true);

    // 🔴 TEMP: Dummy data (replace with API later)
    setTimeout(() => {
      setShipmentData(dummyShipmentData);
      setShipmentLoading(false);
    }, 600);
  }
}, [popupType]);


//patient care 

useEffect(() => {
  if (popupType === "shipment" && selectedPrescription?.prescriptionId) {
    setShipmentLoading(true);

    const fetchShipmentData = async () => {
      try {
        const res = await fetch(
          `https://clinic-backend-jdob.onrender.com/api/patient/prescriptions/week-view/${selectedPrescription.prescriptionId}`
        );

        const data = await res.json();
        setShipmentData(data);
      } catch (error) {
        console.error("Shipment API error:", error);
      } finally {
        setShipmentLoading(false);
      }
    };

    fetchShipmentData();
  }
}, [popupType, selectedPrescription]);


// useEffect(() => {
//   if (popupType === "care") {
//     setPatientCareLoading(true);

//     // 🔴 TEMP dummy data
//     setTimeout(() => {
//       setPatientCareData(dummyPatientCareData);
//       setPatientCareLoading(false);
//     }, 600);
//   }
// }, [popupType]);



   //fetch payment history
   useEffect(() => {
  if (popupType === "payment" && appointmentData?.appointmentId) {
    fetchPaymentHistory();
  }
}, [popupType, appointmentData?.appointmentId]);

const fetchPaymentHistory = async () => {
  try {
    setPaymentLoading(true);

    const res = await fetch(
      `${API_URL}/api/patient/new-crm-appointment/${appointmentData.appointmentId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const result = await res.json();
    setPaymentData(result?.data || []);
  } catch (err) {
    console.error("Payment history error:", err);
  } finally {
    setPaymentLoading(false);
  }
};

//patient inventory
const fetchPatients = async () => {
  try {
    setLoading(true);

    const userId = localStorage.getItem("userId");

    const res = await fetch(
      `${API_URL}/api/doctor-stock/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();
    setPatients(data || []);
    setShowInventoryPopup(true); // 👈 popup OPEN
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};






  // Fetch past appointments
  // useEffect(() => {
  //   const fetchPastHistory = async () => {
  //     if (!id) return;
      
  //     const token = localStorage.getItem('token');
  //     try {
  //       const response = await axios.get(`${API_URL}/api/doctor/getAppointmentWithTimedata`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`
  //         },
  //         params: {
  //           id,
  //           type: 'past'
  //         }
  //       });
  //       setPastHistory(response.data);
  //     } catch (error) {
  //       console.error('Error fetching past history:', error);
  //     }
  //   };
  //   fetchPastHistory();
  // }, [id]);

  // Fetch future appointments
  // useEffect(() => {
  //   const fetchFutureHistory = async () => {
  //     if (!id) return;
      
  //     const token = localStorage.getItem('token');
  //     try {
  //       const response = await axios.get(`${API_URL}/api/doctor/getAppointmentWithTimedata`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`
  //         },
  //         params: {
  //           id,
  //           type: 'future'
  //         }
  //       });
  //       setFutureHistory(response.data);
  //     } catch (error) {
  //       console.error('Error fetching future history:', error);
  //     }
  //   };
  //   fetchFutureHistory();
  // }, [id]);

//   const pieData = {
//     labels: ['Successful Intake', 'Missed'],
//     datasets: [
//       {
//         label: 'Medicine Intake',
//         data: [80, 20],
//         backgroundColor: ['#7ccf7f', '#ff7369'],
//         borderColor: ['#FFFFFF', '#FFFFFF'],
//         borderWidth: 1,
//       },
//     ],
//   };

//  const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   return new Date(dateString).toLocaleDateString();
// };


//   const formatCurrency = (amount) => {
//     return `Rs. ${amount || 0}`;
//   };

  return (
    <DoctorLayout>
      <div className="p-10 rounded-md">
          <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-5 mb-16">
            <div className="grid grid-rows-1 gap-6">
              <div className="flex  gap-6 items-center">
        <div className="w-20 h-20 rounded-full border-4 border-teal-200 flex items-center justify-center bg-teal-50">
          <svg
            className="w-10 h-10 text-teal-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="flex-1 ">
        <h2 className="pb-1 text-2xl font-semibold text-gray-800 leading-tight">
          {patientDetails?.name || "Patient Name"}
        </h2>
        
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-10 text-sm">
      {/* Left column */}
      <div className="space-y-1 pl-2 ">
        <p className="pb-2">
          <span className="font-semibold text-gray-800">Age :</span>{" "}
          <span className="text-gray-700">
            {patientDetails?.age || "N/A"}
          </span>
        </p>
        <p className="pb-2">
          <span className="font-semibold text-gray-800">Gender :</span>{" "}
          <span className="text-gray-700">
            {patientDetails?.gender ||
              patientDetails?.gender ||
              "N/A"}
          </span>
        </p>
        <p className="pb-2">
          <span className="font-semibold text-gray-800">Email :</span>{" "}
          <span className="text-gray-700">
            {patientDetails?.email || "N/A"}
          </span>
        </p>
      </div>
      {/* mid column */}
      <div className="space-y-1 border-l pl-6 border-gray-300">
        <p className="pb-2">
          <span className="font-semibold text-gray-800">Address :</span>{" "}
          <span className="text-gray-700">
            {patientDetails?.address || "N/A"}
          </span>
        </p>
        <p className="pb-2">
          <span className="font-semibold text-gray-800">Source :</span>{" "}
          <span className="text-gray-700">
            {patientDetails?.source ||
              "N/A"}
          </span>
        </p>
        <p className="pb-2">
          <span className="font-semibold text-gray-800">Last Visit :</span>{" "}
          <span className="text-gray-700">
            {patientDetails?.lastVisit || "N/A"}
          </span>
        </p>
      </div>
      {/* right column */}
      <div className="space-y-1 border-l pl-6 border-gray-300">
        <p className="pb-2">
          <span className="font-semibold text-gray-800">Total Payment :</span>{" "}
          <span className="text-gray-700">
            {patientDetails?.payments || "N/A"}
          </span>
        </p>
        <button onClick={fetchPatients}
  className="
    flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-2 rounded-lg shadow-sm">
  {/* Icon */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-3-3v6m4.5-7.5h.008v.008h-.008V7.5zM19.5 12c0 4.142-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5s7.5 3.358 7.5 7.5z"
    />
  </svg>

  Patient Inventory
</button>

        </div>
      </div>
      
      </div>
          </div>

        <div className="">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          

          {activeTab === "Consultation in progress" && (
  <div className="bg-white rounded-xl shadow-2xl p-7 mt-6">

    {loadingConsultations ? (
      <p className="text-center text-gray-500">Loading...</p>
    ) : inProgressConsultations.length === 0 ? (
      <p className="text-center text-gray-400">
        No consultation in progress
      </p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {inProgressConsultations.map((item) => (
          
          <div
            key={item.SelectedAppointmentId}
            className="border rounded-xl p-5 shadow-sm bg-white"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">
                Consultation-{item.appointmentId}
              </h3>

              <span className="bg-orange-100 text-orange-500 px-3 py-1 rounded-lg text-sm">
                Ongoing
              </span>
            </div>

            {/* Details */}
            <div className=" flex justify-between"> 
            <p className="text-sm mb-2">
              <span className="font-semibold">Consulting Type :</span>{" "}
              {item.diseaseType}
            </p>
            <button
  onClick={() => {
    setSelectedAppointmentId(item.appointmentId); // or prescriptionId if needed
    setOpenTimesheet(true);
  }}
  className="text-blue-500 text-xs underline mt-1"
>
  View Timesheet
</button>
            </div>

            <p className="text-sm mb-2">
              <span className="font-semibold ">Consulting For :</span>{" "}
              <span>{item.consultingFor}</span>
            </p>

            <p className="text-sm mb-2">
              <span className="font-semibold">Created on :</span>{" "}
              {new Date(item.createdAt).toLocaleDateString()}
            </p>

            <p className="text-sm mb-4">
              <span className="font-semibold">Total Prescriptions :</span>{" "}
              {item.prescriptionCount}
            </p>

            {/* ACTION */}
            <div className="text-right">
              <button
                onClick={() => {
                  // setSelectedConsultation(item);
                  setAppointmentId(item.appointmentId);
                  setActiveTab("Prescription"); // OR open your prescription page
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                View Prescription
              </button>
              
            </div>
          </div>
        ))}

      </div>
    )}
  </div>
)}

          {activeTab === "Prescription" && selectedConsultation && (
            <>
            
            <div className="bg-white rounded-xl shadow-xl p-7 mt-16" 
            style={{
                      boxShadow: `
      0 -3px 5px rgba(59, 130, 246, 0),   /* Top glow (subtle) */
      -3px 0 5px rgba(59, 130, 246, 0.1),   /* Left glow (subtle) */
      0 6px 16px rgba(59, 130, 246, 0.2),   /* Bottom glow (stronger) */
      6px 0 16px rgba(59, 130, 246, 0.2)    /* Right glow (stronger) */
    `,
                    }}>
              <div className="mb-5 text-base font-bold">
                {patientDetails?.appointmentUniqueId || "N/A"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                     
            {loading ? (
  <p className="text-center text-gray-500">Loading...</p>
) : prescriptions.length > 0 ? (
  <div>
    
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {prescriptions.map((item) => (
      <div
        key={item.prescriptionId}
        className="border rounded-xl p-4 shadow-sm bg-white text-sm  "
        style={{
                      boxShadow: `
      0 -3px 3px rgba(59, 130, 246, 0),   /* Top glow (subtle) */
      -3px 0 3px rgba(59, 130, 246, 0.1),   /* Left glow (subtle) */
      0 6px 8px rgba(59, 130, 246, 0.2),   /* Bottom glow (stronger) */
      6px 0 8px rgba(59, 130, 246, 0.2)    /* Right glow (stronger) */
    `,
                    }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">
            PRESCRIPTION - {item.prescriptionId.slice(-6)}
          </h3>

          <span
  className={`px-3 py-1 rounded-lg text-sm font-medium
    ${
      item.status === "Completed" || item.status === "Closed"
        ? "bg-green-100 text-green-600"
        : "bg-orange-100 text-orange-500"
    }`}
>
  {item.status === "Completed" || item.status === "Closed"
    ? "Completed"
    : "Ongoing"}
</span>

        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 mb-1 ">
          Consulting Type : {item.diseaseType}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          Consulting For : {item.consultingFor}
        </p>
        <p className="text-sm text-gray-600 pb-1 mb-1">
          Created on :{" "}
          {new Date(item.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>

        {/* Medicines */}
        <p className="mt-3 font-semibold text-sm">Medicines</p>
        <ul className="text-sm text-gray-600 list-disc ml-5 pl-5">
          {item.medicineNames
            ?.split(",")
            .map((med, i) => (
              <li key={i}>{med.trim()}</li>
            ))}
        </ul>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 mr-1 mb-3">
          <button
  onClick={() => {
    setPopupType("medicine");
    setSelectedPrescription(item);
    setOpenPopup(true);
  }}
  className="bg-green-500 text-white px-3 py-1 rounded text-xs"
>
  Medicine Preparation
</button>

          <button
  onClick={() => {
    setPopupType("shipment");
    setOpenPopup(true);
  }}
  className="bg-green-500 text-white px-3 py-1 rounded text-xs"
>
  Shipment
</button>

          <button
  onClick={() => {
    setPopupType("care");
    setOpenPopup(true);
  }}
  className="bg-green-500 text-white px-3 py-1 rounded text-xs"
>
  Patient Care
</button>

          <button
  onClick={() => {
    setPopupType("payment");
    setOpenPopup(true);
  }}
  className="bg-green-500 text-white px-3 py-1 rounded text-xs"
>
  Payment History
</button>

        </div>
      </div>
    ))}
  </div>
  </div>
) : (
  <p className="text-center text-gray-500">
    No prescriptions found
  </p>
)}          
      </div>
        </div>
            
            </>
          )}
    </div>
        

        <div className="">

          {/* New Patient Tab Content */}
          {activeTab === "Past / Completed Consultation" && ( <>
              <div className="bg-white rounded-xl shadow-2xl p-7 mt-6">
    {completedConsultations.length === 0 ? (
      <p className="text-center text-gray-400">
        No completed consultations
      </p>
    ) : (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {completedConsultations.map((item) => (
      <div
        key={item.appointmentId}
        className="border rounded-xl p-5 shadow-sm bg-white"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">
            Consultation-{item.appointmentUniqueId}
          </h3>

          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-sm">
            Completed
          </span>
        </div>

        {/* Details */}
        <p className="text-sm mb-2">
          <span className="font-semibold">Consulting Type :</span>{" "}
          {item.diseaseType}
        </p>

        <p className="text-sm mb-2">
          <span className="font-semibold">Consulting For :</span>{" "}
          {item.consultingFor}
        </p>

        <p className="text-sm mb-2">
          <span className="font-semibold">Created on :</span>{" "}
          {new Date(item.createdAt).toLocaleDateString()}
        </p>

        <p className="text-sm mb-4">
          <span className="font-semibold">Total Prescriptions :</span>{" "}
          {item.prescriptionCount}
        </p>

        {/* ACTION */}
        <div className="text-right">
          <button
            onClick={() => {
              setSelectedConsultation(item);
              setActiveTab("Prescription");
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            View Prescription
          </button>
        </div>
      </div>
    ))}

  </div>
)
}
  </div>
          </>)}</div>
        {/* Disease History and Medicine/Workshop Tabs */}
        
      </div>

      {openPopup && popupType === "medicine" && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl w-[90%] max-w-4xl p-6 relative">

      {/* Close */}
      <button
        onClick={() => setOpenPopup(false)}
        className="absolute top-4 right-4 text-2xl font-semibold"
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold mb-6">
        Medicine Preparation
      </h2>

      {/* Header Row */}
      <div className="grid grid-cols-5 font-semibold text-gray-700 mb-6 text-sm text-center">
        <div>Date & Time</div>
        <div>Medicine</div>
        <div>Video</div>
        <div>Image</div>
        <div>Status</div>
      </div>

      {/* Scroll Area */}
      <div className="max-h-[350px] overflow-y-auto space-y-6 text-sm text-center ">
        {popupLoading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : medicineData.length > 0 ? (
          medicineData.map((med, index) => (
            <div
              key={index}
              className="grid grid-cols-5 items-center text-gray-600"
            >
              {/* Date */}
              <div>
                {new Date(med.medPrepStartTime).toLocaleDateString("en-GB")},
                <br />
                {new Date(med.medPrepStartTime).toLocaleTimeString()}
              </div>

              {/* Medicine */}
              <div>{med.medicineName}</div>

              {/* Video */}
              <div>
                <a
                  href={med.preparationVideoUrl}
                  target="_blank"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                >
                  ▶ Play Video
                </a>
              </div>

              {/* Image */}
              <div>
                <a
                  href={med.preparationPhoto}
                  target="_blank"
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg"
                >
                  View Image
                </a>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`px-4 py-2 rounded-lg text-white ${
                    med.attempt === 0
                      ? "bg-orange-400"
                      : "bg-green-500"
                  }`}
                >
                  {med.attempt === 0 ? "Preparing" : "Completed"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No medicine preparation found
          </p>
        )}
      </div>
    </div>
  </div>
)} 
      {openPopup && popupType === "payment" && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl w-[90%] max-w-4xl p-6 relative">

      {/* Close */}
      <button
        onClick={() => setOpenPopup(false)}
        className="absolute top-4 right-4 text-2xl"
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold mb-6">
        Payment History
      </h2>

      {/* Header */}
      <div className="grid grid-cols-5 font-semibold text-gray-700 mb-6 text-sm text-center">
        <div>Date & Time</div>
        <div>Service</div>
        <div>Payment ID</div>
        <div>Amount</div>
        <div>Status</div>
      </div>

      {/* Scroll */}
      <div className="max-h-[350px] overflow-y-auto space-y-4 mb-6 text-sm text-center">
        {paymentLoading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : paymentData.length > 0 ? (
          paymentData.map((pay) => (
            <div
              key={pay._id}
              className="grid grid-cols-5 items-center text-gray-600"
            >
              {/* Date */}
              <div>
                {new Date(pay.createdAt).toLocaleDateString("en-GB")},
                <br />
                {new Date(pay.createdAt).toLocaleTimeString()}
              </div>

              {/* Service */}
              <div>{pay.paidFor}</div>

              {/* Payment ID */}
              <div className="truncate">
                {pay.razorpayPaymentId}
              </div>

              {/* Amount */}
              <div className="font-semibold">
                Rs.{pay.amount}
              </div>

              {/* Status */}
              <div>
                <span className="bg-green-500 text-white px-4 py-2 rounded-lg">
                  {pay.status === "paid" ? "Paid" : pay.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No payment history found
          </p>
        )}
      </div>
    </div>
  </div>
)}
       
       {openPopup && popupType === "shipment" && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl w-[90%] max-w-4xl p-8 relative">

      {/* Close */}
      <button
        onClick={() => setOpenPopup(false)}
        className="absolute top-4 right-4 text-2xl"
      >
        ✕
      </button>

      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold">Shipment</h2>

        {/* Status */}
        
      </div>

      {shipmentLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : shipmentData ? (
        <div className="space-y-4 text-lg text-gray-700">
          <p className="justify-between gap-y-164">
            <span className="font-semibold">Shipment ID :</span>{" "}
            {shipmentData.shipmentId}
            <span className="bg-orange-400 text-white px-5 py-2 rounded-lg text-xs pt-2 pb-2 ml-96">
          {shipmentData?.status}
        </span>
          </p>
          
          <p>
            <span className="font-semibold">Partner :</span>{" "}
            {shipmentData.partner}
          </p>

          <p>
            <span className="font-semibold">Created On :</span>{" "}
            {new Date(shipmentData.createdOn).toLocaleDateString("en-GB")}
          </p>

          <p>
            <span className="font-semibold">Shipping Date :</span>{" "}
            {new Date(shipmentData.shippingDate).toLocaleDateString("en-GB")}
          </p>

          <p>
            <span className="font-semibold">Arrival Date :</span>{" "}
            {new Date(shipmentData.arrivalDate).toLocaleDateString("en-GB")}
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No shipment details found
        </p>
      )}
    </div>
  </div>
)}

       {openPopup && popupType === "care" && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl w-[90%] max-w-5xl p-8 relative">

      {/* Close */}
      <button
        onClick={() => setOpenPopup(false)}
        className="absolute top-4 right-4 text-2xl"
      >
        ✕
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Patient Care</h2>
        
      </div>

      {patientCareLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : patientCareData && (
        <>
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            
            {/* Calendar (REAL) */}
{/* Calendar (REAL – Tailwind only) */}
<div className="border rounded-xl p-3 w-64 bg-white">
  <Calendar
    onChange={setSelectedDate}
    value={selectedDate}

    // hide double arrows
    prev2Label={null}
    next2Label={null}

    // Navigation styling
    navigationLabel={({ label }) => (
      <span className="font-semibold text-blue-600">
        {label}
      </span>
    )}

    // Date tile styling
    tileClassName={({ date, view }) => {
      if (view === "month") {
        const isToday =
          date.toDateString() === new Date().toDateString();
        const isSelected =
          selectedDate &&
          date.toDateString() === selectedDate.toDateString();

        if (isSelected) {
          return "bg-blue-500 text-white rounded-lg";
        }

        if (isToday) {
          return "bg-blue-100 text-blue-700 font-semibold rounded-lg";
        }

        return "hover:bg-blue-50 rounded-lg";
      }
    }}

    // Wrapper classes
    className="w-full text-sm"
  />
</div>



            {/* Summary */}
            <div className="md:col-span-2  space-y-4 text-lg p-16 pt-16">
              <p>
                <span className="font-semibold">Total Dosage :</span>{" "}
                {patientCareData.summary.total}
              </p>
              <p>
                <span className="font-semibold">Taken :</span>{" "}
                {patientCareData.summary.taken}
              </p>
              <p>
                <span className="font-semibold">Missed :</span>{" "}
                {patientCareData.summary.missed}
              </p>
              <p>
                <span className="font-semibold">Pending :</span>{" "}
                {patientCareData.summary.pending}
              </p>
            </div>
            <span className="bg-orange-400 text-white px-5 py-2 rounded-lg h-8 w-24">
          {patientCareData?.status}
        </span>
          </div>

          {/* Medicine Schedule */}
          <h3 className="text-xl font-semibold mb-4">
            Medicine Schedule
          </h3>

          <div className="max-h-[220px] overflow-y-auto">
            <table className="w-full border rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Medicine</th>
                  <th className="p-3 text-left">Dose Time</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {patientCareData.schedule.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{row.medicine}</td>
                    <td className="p-3">{row.time}</td>
                    <td className="p-3">
                      <span className="bg-orange-100 text-orange-500 px-3 py-1 rounded-lg">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  </div>
)}

      {openTimesheet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setOpenTimesheet(false)} // Close on backdrop click
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-semibold">view prescription</h2>
              <button
                onClick={() => setOpenTimesheet(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                &times;
              </button>
            </div>
          
  <MedicineCalendar
    appointmentId={selectedAppointmentId}
    onClose={() => setOpenTimesheet(false)}
  /></div></div>
)}


       {showInventoryPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">

      {/* Close button */}
      <button
        onClick={() => setShowInventoryPopup(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold mb-4">
        Patient Inventory
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : patients.length === 0 ? (
        <p className="text-gray-500">No inventory found</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {patients.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{item.medicineName}</p>
                <p className="text-sm text-gray-600">
                  Quantity : {item.quantity}
                </p>
              </div>

              <span className="text-sm text-blue-600">
                {item.status || "Available"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}



    </DoctorLayout>
  );
};

export default ViewDetails;