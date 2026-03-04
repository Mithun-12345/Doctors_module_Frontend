import React, { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import config from "../../config";

import { useParams } from "react-router-dom";
const API_URL = config.API_URL;

const NewAppointment = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [reservedAppointment, setReservedAppointment] = useState(null);
  const { patientId } = useParams();
  const [timeSlots, setTimeSlots] = useState({

    Normal: [],
    "Post Working Hours": [],
    Weekoff: []
  });
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedSlotPrice, setSelectedSlotPrice] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [symptomInput, setSymptomInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [patientError, setPatientError] = useState("");
  const [consultingFor, setConsultingFor] = useState(null);
  const [consultingReason, setConsultingReason] = useState(null);
  const [symptom, setSymptom] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [consulting, setConsulting] = useState("");

  const today = dayjs();
  const minDate = today;
  const maxDate = today.add(1, "month");
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_URL}/api/doctor/getPatientWithAppointments/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(res, "response")
        setPatientData(res.data.patient);
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientData();
  }, [patientId]);
  console.log(patientId, "patientId")
  useEffect(() => {
    if (patientId) {
      setConsultingFor({ value: patientId, label: "Selected Patient" });
    }
  }, [patientId]);
  const consultingReasons = [
    "Accidents",
    "Acute Back Pain",
    "Acute Bronchitis",
    "Acute Contact Dermatitis",
    "Acute migraine / headache",
    "Acute Eczema Flare-ups",
    "Acute Kidney Injury",
    "Acute viral fever",
    "Acute Pelvic Inflammatory Disease (PID)",
    "Acute Sinusitis",
    "Acute Urticaria",
    "Alzheimer's Disease",
    "Allergic cough",
    "Allergic skin rashes",
    "Ankylosing Spondylitis",
    "Asthma",
    "Atrial Fibrillation",
    "Bipolar Disorder",
    "Boils, abscess",
    "Breast Cancer",
    "Chronic Bronchitis",
    "Chronic Hepatitis (B and C)",
    "Chronic Kidney Disease",
    "Chronic Migraine",
    "Chronic Obstructive Pulmonary Disease",
    "Colorectal Cancer",
    "Common Cold",
    "Coronary Artery Disease",
    "COVID-19",
    "Crohn's Disease",
    "Croup",
    "Dengue Fever",
    "Diabetes (Type 1 and Type 2)",
    "Diabetic Nephropathy",
    "Epilepsy",
    "Fibromyalgia",
    "Gastroenteritis",
    "Generalized Anxiety Disorder",
    "Glomerulonephritis",
    "Heart Failure",
    "Head injury",
    "Hypertension (High Blood Pressure)",
    "Hyperthyroidism",
    "Hypothyroidism",
    "Injury, cuts, burns, bruise, blow",
    "Impetigo",
    "Influenza (Flu)",
    "Irritable Bowel Syndrome (IBS)",
    "Leukemia",
    "Lung Cancer",
    "Major Depressive Disorder",
    "Malaria",
    "Metabolic Syndrome",
    "Multiple Sclerosis",
    "Nephrolithiasis (Kidney Stones)",
    "Non-Alcoholic Fatty Liver Disease",
    "Osteoarthritis",
    "Osteoporosis",
    "Oral Ulcers",
    "Parkinson's Disease",
    "Peripheral Artery Disease",
    "Polycystic Kidney Disease",
    "Polycystic Ovary Syndrome (PCOS)",
    "Post-Traumatic Stress Disorder (PTSD)",
    "Prostate Cancer",
    "Psoriasis",
    "Pulmonary Hypertension",
    "Rheumatoid Arthritis",
    "Schizophrenia",
    "Scleroderma",
    "Sjogren's Syndrome",
    "Sprains and Strains",
    "Strep Throat",
    "Systemic Lupus Erythematosus (SLE)",
    "Tooth Pain",
    "Trauma",
    "Ulcerative Colitis",
    "Urinary Tract Infection (UTI)",
    "Other",
  ];

  // const consultingReasonOptions = consultingReasons.map((reason) => ({
  //   value: reason,
  //   label: reason,
  // }));
  const consultingReasonOptions = consultingReasons.map((reason) => ({
    value: reason,
    label: reason,
  }));
  // Load Razorpay Script
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://checkout.razorpay.com/v1/checkout.js";
  //   script.async = true;
  //   script.onload = () => setIsRazorpayLoaded(true);
  //   script.onerror = () => console.error("Razorpay script failed to load");
  //   document.body.appendChild(script);

  //   return () => {
  //     document.body.removeChild(script);
  //   };
  // }, []);

  // Get user info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch family members and set consultingFor options
  // useEffect(() => {
  //   const fetchFamilyMembers = async () => {
  //     const token = localStorage.getItem("token");
  //     try {
  //       const res = await axios.get(`${API_URL}/api/patient/getFamilyMembers`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const userId = JSON.parse(atob(token.split(".")[1])).id;
  //       const options = [
  //         { value: userId, label: "Self" },
  //         ...res.data.familyMembers.map((member) => ({
  //           value: member.id,
  //           label: member.relationship,
  //         })),
  //       ];
  //       setConsultingForOptions(options);
  //       setConsultingFor(options[0]); // Default to Self
  //     } catch (err) {
  //       console.error("Error fetching family members:", err);
  //       setErrorMessage("Failed to load family members");
  //     }
  //   };
  //   fetchFamilyMembers();
  // }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (startDate) {
        const token = localStorage.getItem("token");
        const appointmentDate = dayjs(startDate).format("YYYY-MM-DD");
        console.log("Sending payload:", {

        });
        try {
          const res = await axios.post(
            `${API_URL}/api/doctor/checkSlots`,
            { appointmentDate, patientId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAvailableSlots(res.data.availableSlots || []);
          setSelectedTime(null);
        } catch (err) {
          console.error("Error fetching slots:", err);
          setErrorMessage("Failed to load available slots");
        }
      }
    };
    fetchSlots();
  }, [startDate]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (startDate) {
        setIsLoadingSlots(true);
        const token = localStorage.getItem("token");
        const formattedDate = dayjs(startDate).format("YYYY-MM-DD");

        try {
          const res = await axios.post(
            `${API_URL}/api/doctor/appointmentBookingTimeSlot`,
            { date: formattedDate },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          setTimeSlots(res.data.result || { Normal: [], "Post Working Hours": [], Weekoff: [] });
          setSelectedTime(null);
          setSelectedSlotPrice(null);
          setErrorMessage("");
        } catch (err) {
          console.error("Error fetching time slots:", err);
          setErrorMessage("Failed to load available time slots");
          setTimeSlots({ Normal: [], "Post Working Hours": [] });
        } finally {
          setIsLoadingSlots(false);
        }
      } else {
        setTimeSlots({ Normal: [], "Post Working Hours": [], Weekoff: [] });
      }
    };

    fetchTimeSlots();
  }, [startDate]);

  // Check appointment status periodically if reserved
  // useEffect(() => {
  //   let interval;
  //   if (reservedAppointment) {
  //     interval = setInterval(async () => {
  //       try {
  //         const token = localStorage.getItem("token");
  //         const res = await axios.get(
  //           `${API_URL}/api/payments/appointment-status/${reservedAppointment.appointmentId}`,
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );

  //         if (res.data.status === "confirmed") {
  //           clearInterval(interval);
  //           navigate("/home", { state: { bookingSuccess: true } });
  //         } else if (res.data.isExpired) {
  //           clearInterval(interval);
  //           setErrorMessage("Reservation expired. Please try again.");
  //           setReservedAppointment(null);
  //         }
  //       } catch (err) {
  //         console.error("Error checking appointment status:", err);
  //       }
  //     }, 5000);
  //   }
  //   return () => clearInterval(interval);
  // }, [reservedAppointment, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!startDate) errors.date = "Please select a date";
    if (!selectedTime) errors.time = "Please select a time slot";
    if (!consultingFor)
      errors.consultingFor = "Please select consulting person";
    if (consultingReason?.value === "Other" && symptom.length < 10) {
      errors.symptom = "Please enter at least 10 characters for symptom";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookClick = () => {
    if (validateForm()) {
      setReservedAppointment(null);   // clear old booking
      setErrorMessage("");
      setIsPopupOpen(true);
    }
  };

  const handleTimeSlotSelect = (slot, category) => {
    setSelectedTime(slot.time);
    setSelectedSlotPrice({ price: slot.price, category });
    setReservedAppointment(null);
    setErrorMessage("");
  };

  const reserveAppointment = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const appointmentDate = dayjs(startDate).format("YYYY-MM-DD");

      const payload = {
        patientId,
        appointmentDate,
        timeSlot: selectedTime,
        consultingReason: analysisResult?.classification || "",
        symptom: symptomInput || "",
        
        
      };

      console.log("Sending payload:", payload);

      const res = await axios.post(
        `${API_URL}/api/doctor/bookAppointment`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Booking failed");
      }

      // ✅ Set simple success state (NO payment fields)
      setReservedAppointment({
        appointmentId: res.data.appointmentId,
      });

      return res.data;

    } catch (err) {
      console.error("Error booking appointment:", err);

      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Booking failed. Please try again.";

      setErrorMessage(errorMsg);
      return null;   // ❗ don’t throw error now
    } finally {
      setIsProcessing(false);
    }
  };

  // const createRazorpayOrder = async (appointmentId, amount) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const orderRes = await axios.post(
  //       `${API_URL}/api/payments/create-order`,
  //       { amount: amount * 100, appointmentId },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     return orderRes.data.order;
  //   } catch (err) {
  //     console.error("Error creating order:", err);
  //     throw err;
  //   }
  // };

  const handleAnalyzeSymptom = async () => {
    if (!symptomInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/groq/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: symptomInput,
          patientId: userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalysisResult(result.data);
      } else {
        console.error("Analysis failed:", result);
      }
    } catch (error) {
      console.error("Error analyzing symptom:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const verifyPayment = async (paymentResponse, appointmentId) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        appointmentId,
      };

      console.log("🔍 Sending verification request with payload:", payload);

      const verifyRes = await axios.post(
        `${API_URL}/api/payments/verify-payment`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Verification successful:", verifyRes.data);
      return verifyRes.data;
    } catch (err) {
      console.error("❌ Payment verification failed:");
      if (err.response) {
        console.error(
          "📄 Response Data:",
          JSON.stringify(err.response.data, null, 2)
        );
        console.error("📄 Status:", err.response.status);
        console.error("📄 Headers:", err.response.headers);
      } else if (err.request) {
        console.error("📡 No response received. Request was:", err.request);
      } else {
        console.error("⚠ Error setting up request:", err.message);
      }
      throw err;
    }
  };

 const handleConfirmClick = async (isEmergency) => {
  setIsProcessing(true);
  setErrorMessage("");

  try {
    const token = localStorage.getItem("token");
    const appointmentDate = dayjs(startDate).format("YYYY-MM-DD");

    const payload = {
      patientId,
      appointmentDate,
      timeSlot: selectedTime,
      consultingReason: analysisResult?.classification || "",
      symptom: symptomInput || "",
      isEmergency: isEmergency, 
    };

    const res = await axios.post(
      `${API_URL}/api/doctor/bookAppointment`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      setReservedAppointment({
        appointmentId: res.data.appointmentId,
        message: isEmergency
          ? "Emergency appointment booked successfully!"
          : "Appointment booked successfully!",
      });

      setErrorMessage("");

      // Auto close popup and navigate after 2s
      setTimeout(() => {
        navigate("/appointments/list", { state: { bookingSuccess: true } });
      }, 2000);
    }
  } catch (err) {
    console.error("Booking error:", err);
    setErrorMessage(
      err.response?.data?.message || "Booking failed. Please try again."
    );
  } finally {
    setIsProcessing(false);
  }
};

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setErrorMessage("");
    setIsProcessing(false);
  };

  return (
    <DoctorLayout>
      <div className="max-w-4xl mx-auto py-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-bold text-center bg-blue-100 p-3 rounded">
            Book an Appointment
          </h2>

          <div>
            <label className="font-semibold block mb-2">
              Consulting Person
            </label>
            <div>
              <label className="font-semibold block mb-2">
                Booking For
              </label>
              <div className="p-2 border rounded bg-gray-100">
                Selected Patient :{" "}
                {loadingPatient ? (
                  "Loading..."
                ) : patientData ? (
                  <span className="font-bold">{patientData.name}</span>
                ) : (
                  "Unable to fetch patient details"
                )}
              </div>
            </div>
            {formErrors.consultingFor && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.consultingFor}
              </p>
            )}
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Enter your symptoms
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                className="flex-1 border rounded p-2"
                placeholder="Describe your symptoms..."
              />
              <button
                onClick={handleAnalyzeSymptom}
                disabled={!symptomInput.trim() || isAnalyzing}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>
            {formErrors.symptomInput && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.symptomInput}
              </p>
            )}
            {analysisResult && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  <strong>Disease Has Been Analysed</strong>
                </p>
              </div>
            )}
          </div>

          {consultingReason?.value === "Other" && (
            <div>
              <label className="font-semibold block mb-2">
                Symptom (required)
              </label>
              <textarea
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                className="w-full border rounded p-2 min-h-[80px]"
                placeholder="Describe your symptom in detail..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {symptom.length}/10 characters minimum
              </p>
              {formErrors.symptom && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.symptom}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={startDate}
              onChange={setStartDate}
              minDate={minDate}
              maxDate={maxDate}
            />
          </LocalizationProvider>
          {formErrors.date && (
            <p className="text-red-500 text-sm">{formErrors.date}</p>
          )}

          <div>
            <label className="text-lg font-semibold block mb-2">Pick Your Time</label>

            {timeSlots.Normal && timeSlots.Normal.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Normal Hours</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.Normal.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSlotSelect(slot, "Normal")}
                      className={`p-2 rounded border transition ${selectedTime === slot.time
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-blue-100"
                        }`}
                    >
                      <div className="text-sm">{slot.time}</div>
                      <div className="text-xs">₹{slot.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {timeSlots["Post Working Hours"] && timeSlots["Post Working Hours"].length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Post Working Hours</h3>
                <p className="text-xs text-amber-600 mb-2 bg-amber-50 p-2 rounded border border-amber-200">
                  ℹ️ Slots after regular working hours are charged at a premium rate due to extended service availability.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots["Post Working Hours"].map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSlotSelect(slot, "Post Working Hours")}
                      className={`p-2 rounded border transition ${selectedTime === slot.time
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-blue-100"
                        }`}
                    >
                      <div className="text-sm">{slot.time}</div>
                      <div className="text-xs">₹{slot.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {timeSlots.Weekoff && timeSlots.Weekoff.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Weekend/Holiday</h3>
                <p className="text-xs text-blue-600 mb-2 bg-blue-50 p-2 rounded border border-blue-200">
                  ℹ️ Weekend and holiday slots are available at increased rates.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.Weekoff.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSlotSelect(slot, "Weekoff")}
                      className={`p-2 rounded border transition ${selectedTime === slot.time
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-blue-100"
                        }`}
                    >
                      <div className="text-sm">{slot.time}</div>
                      <div className="text-xs">₹{slot.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formErrors.time && (
              <p className="text-red-500 text-sm mt-1">{formErrors.time}</p>
            )}

            {selectedSlotPrice && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm">
                  <strong>Selected Time:</strong> {selectedTime}
                </p>
                <p className="text-sm">
                  <strong>Consultation Fee:</strong> ₹{selectedSlotPrice.price}
                </p>
                {selectedSlotPrice.category === "Post Working Hours" && (
                  <p className="text-xs text-amber-700 mt-1">
                    * Premium pricing for post-working hours
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleBookClick}
            className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 transition"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Book Appointment"}
          </button>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Confirm Your Booking</h2>
              <div className="mb-4 space-y-2">
                <p>
                  <strong>Date:</strong> {startDate?.format("DD-MM-YYYY")}
                </p>
                <p>
                  <strong>Time:</strong> {selectedTime}
                </p>
                <p>
                  <strong>Consultation Fee:</strong> ₹{selectedSlotPrice?.price}
                </p>
                {selectedSlotPrice?.category === "Post Working Hours" && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-1">
                    * This is a post-working hours slot with premium pricing
                  </p>
                )}
                <p>
                  <strong>Consulting For:</strong> {patientData.name}
                </p>
                {consultingReason && (
                  <p>
                    <strong>Reason:</strong> {consultingReason?.label}
                  </p>
                )}
                {consultingReason?.value === "Other" && symptom && (
                  <p>
                    <strong>Symptom:</strong> {symptom}
                  </p>
                )}

              </div>

              {reservedAppointment && (
                <p className="text-green-600 font-semibold">
                  {reservedAppointment.message}
                </p>
              )}

              {errorMessage && !reservedAppointment && (
                <p className="text-red-500">{errorMessage}</p>
              )}

              <div className="flex gap-4 justify-end">
                {!reservedAppointment ? (
                  <>
                    
                    <button
                      onClick={() => handleConfirmClick(false)}
                      disabled={isProcessing}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {isProcessing ? "Booking..." : "Confirm Booking"}
                    </button>

                   
                    <button
                      onClick={() => handleConfirmClick(true)}
                      disabled={isProcessing}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Emergency
                    </button>

                    <button
                      onClick={handlePopupClose}
                      disabled={isProcessing}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handlePopupClose}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default NewAppointment;