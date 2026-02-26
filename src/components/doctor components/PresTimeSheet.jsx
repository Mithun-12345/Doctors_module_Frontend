import { useEffect, useMemo, useRef, useState } from 'react'

const API_URL = 'https://clinic-backend-jdob.onrender.com'
const PATIENT_ID = '68e8d38c22995210fcbea35c'

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const hours = Array.from({ length: 24 }, (_, i) => i)

const MedicineCalendar = ({ fullHeight = false, onClick }) => {
  const today = new Date()
  // const dayRefs = useRef([])
  const [year, setYear] = useState(today.getFullYear())
  const [eventsByDate, setEventsByDate] = useState({})
  const [view, setView] = useState('day') // day | hour
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [month, setMonth] = useState(today.getMonth() - 2)
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = first week


  useEffect(() => {
  if (month < 0) {
    setYear((y) => y - 1)
    setMonth(12 + month)
  }
  if (month > 11) {
    setYear((y) => y + 1)
    setMonth(month - 12)
  }
}, [month])


  /* ---------------- API FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token missing')

        const res = await fetch(
          `${API_URL}/api/doctor/appointment/reminderId/active`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        )

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()

        const map = {}
        json.data.forEach((item) => {
          const dateKey = item.date.split('T')[0]
          if (!map[dateKey]) map[dateKey] = []
          map[dateKey].push({
            id: item.reminderId,
            medicineName: item.medicineName,
            quantityConsumed: item.quantityConsumed ?? 0,
            doseTime: item.doseTime,
          })
        })

        setEventsByDate(map)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  /* ---------------- MONTH VIEW ---------------- */
  const monthCalendar = useMemo(() => {
  const days = []
  const firstDay = new Date(year, month, 1).getDay()
  const leading = (firstDay + 6) % 7

  for (let i = 0; i < leading; i++) {
    days.push({ month: -1, day: 0 })
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ month, day: d })
  }

  while (days.length % 7 !== 0) {
    days.push({ month: -1, day: 0 })
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return weeks.map((week, wi) => (
    <div className="flex w-full" key={wi}>
      {week.map(({ month, day }, di) => {
        const dateKey =
          month >= 0
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : null

        const events = dateKey ? eventsByDate[dateKey] || [] : []

        return (
  <div
    key={di}
    className="relative aspect-square w-full border rounded-xl "
  >
    <span className="absolute left-1 top-1 text-xs">{day || ''}</span>

    {events.length > 0 && (
      <div
        className="relative h-16 hover:bg-blue-200 ml-3 mr-3 border-l-4 border-orange-500 bg-orange-100 rounded-md px-2 top-5 flex flex-col justify-center gap-1"
      >
        {events.slice(0, 2).map((e, ) => (
          <div
            key={e.id}
            className="text-40 font-semibold leading-tight"
          >
            {e.medicineName} ({e.quantityConsumed})
          </div>
        ))}
        {events.length > 2 && (
          <div className="text-[10px] text-red-500 mt-1">
            +{events.length - 2} more
          </div>
        )}
      </div>
    )}
  </div>
);
      })}
    </div>
  ))
}, [year, month, eventsByDate])


  /* ---------------- HOUR VIEW ---------------- */
//   const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1)
// const firstWeekDay = firstDayOfMonth.getDay() // 0=Sun,1=Mon...


const getWeekDates = (year, month, week) => {
  const firstDayOfMonth = new Date(year, month, 1)

  const startOffset = (firstDayOfMonth.getDay() + 6) % 7 // Monday start
  const firstMonday = new Date(year, month, 1 - startOffset)

  const weekStart = new Date(firstMonday)
  weekStart.setDate(firstMonday.getDate() + (week - 1) * 7)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
}

const hourCalendar = () => {
  const days = getWeekDates(year, month, selectedWeek)

  return (
    
    <div className="overflow-auto border rounded-xl">
      
      {/* HEADER */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-white sticky top-0 ">
        <div />
        {days.map((d, i) => (
          <div key={i} className="p-2 text-xs text-center font-medium">
            {weekDays[d.getDay()]} – {d.getDate()}
          </div>
        ))}      </div>

      {/* BODY */}
      {hours.map((h) => (
        <div key={h} className="grid grid-cols-[80px_repeat(7,1fr)] border-b ">
          <div className="p-2 text-xs text-slate-500">
            {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
          </div>

          {days.map((d, i) => {
            const dateKey = `${d.getFullYear()}-${String(
              d.getMonth() + 1
            ).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

            const events = (eventsByDate[dateKey] || []).filter((e) => {
  const eventHour = Number(e.doseTime.split(':')[0])
  return eventHour === h
})

            

            return (
  <div
    key={i}
    className="relative h-16 border-l flex flex-col justify-center px-1"
  >
    {events.length > 0 && (
      <div
        className={`
          rounded-md
          bg-orange-100
          px-2
          hover:bg-blue-200
          border-l-4 border-orange-500
          flex flex-col
          justify-center
          gap-1
          h-full
          text-40 font-semibold
        `}
      >
        {events.slice(0, 2).map((e) => (
          <span key={e.id} className="truncate ">
            {e.medicineName} ({e.quantityConsumed})
          </span>
        ))}
        {events.length > 2 && (
          <span className="text-red-500 ">+{events.length - 2} more</span>
        )}
      </div>
    )}
  </div>
);

          })}
        </div>
      ))}
    </div>
  )
}


  if (loading) return <p className="p-4 text-center">Loading…</p>
  if (error) return <p className="p-4 text-center text-red-500">{error}</p>

  /* ---------------- FINAL RETURN ---------------- */
  return (
    <div className={`rounded-xl bg-white p-4 ${fullHeight ? '' : 'max-h-[80vh] overflow-y-auto'}`}>
      {/* HEADER */}
      <div className="flex items-center gap-2">
  {/* YEAR */}
  <select
    value={year}
    onChange={(e) => setYear(Number(e.target.value))}
    className="border rounded px-2 py-1 text-sm"
  >
    {[year - 1, year, year + 1].map((y) => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>

  {/* MONTH */}
  <select
    value={month}
    onChange={(e) => setMonth(Number(e.target.value))}
    className="border rounded px-2 py-1 text-sm"
  >
    {monthNames.map((m, i) => (
      <option key={i} value={i}>{m}</option>
    ))}
  </select>
  {view === 'hour' && (
  <select
    value={selectedWeek}
    onChange={(e) => setSelectedWeek(Number(e.target.value))}
    className="border rounded px-2 py-1 text-sm"
  >
    {[0, 1, 2, 3, 4].map((w) => (
      <option key={w} value={w}>
        Week {w + 1}
      </option>
    ))}
  </select>
)}


</div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold"></h2>
        <div className="flex border rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1 text-sm rounded-md ${
              view === 'day' ? 'bg-blue-500 text-white' : ''
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView('hour')}
            className={`px-3 py-1 text-sm rounded-md ${
              view === 'hour' ? 'bg-blue-500 text-white' : ''
            }`}
          >
            Hour
          </button>
        </div>
      </div>
      {/* CALENDAR */}
      {view === 'day' && (
  <div className="grid grid-cols-7 mb-2 text-sm font-medium text-center text-slate-600">
    <div className=''>Monday</div>
    <div>Tuesday</div>
    <div>Wednesday</div>
    <div>Thursday</div>
    <div>Friday</div>
    <div>Saturday</div>
    <div>Sunday</div>
  </div>
)}
      {view === 'day' ? monthCalendar : hourCalendar()}
    </div>
  )
}

export default MedicineCalendar

