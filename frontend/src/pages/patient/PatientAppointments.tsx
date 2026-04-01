import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Plus, X, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { patientModuleApi } from '@/services/api';

const statusStyle: Record<string, { color: string; bg: string }> = {
    CONFIRMED: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    PENDING: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    COMPLETED: { color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
    CANCELLED: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const specialties = ['Cardiology', 'Dermatology', 'Orthopedics', 'Neurology', 'Pediatrics'];
const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

const PatientAppointments = () => {
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [showBooking, setShowBooking] = useState(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const [doctors, setDoctors] = useState<any[]>([]);

    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await patientModuleApi.getDoctors();
            setDoctors(res.data);
        } catch (err) {
            console.error('Failed to fetch doctors', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await patientModuleApi.getAppointments();
            setAppointments(res.data);
        } catch (err) {
            console.error('Failed to fetch appointments', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = selectedSpecialty ? doctors.filter(d => d.specialization === selectedSpecialty) : doctors;

    const handleBook = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) return;
        try {
            // Combine date and time for ISO string
            const datetime = new Date(`${selectedDate}T${selectedTime.replace(' AM', ':00').replace(' PM', ':00')}`); // Simplified time parsing
            
            await patientModuleApi.bookAppointment({
                doctorId: selectedDoctor, // Expecting ID, hacky mapping for now
                date: datetime.toISOString(),
                reason: notes || 'New appointment'
            });
            fetchAppointments();
            setBookingSuccess(true);
            hapticSuccess();
            setTimeout(() => {
                setShowBooking(false);
                setBookingSuccess(false);
                setSelectedSpecialty('');
                setSelectedDoctor('');
                setSelectedDate('');
                setSelectedTime('');
                setNotes('');
            }, 1500);
        } catch (err) {
            console.error('Failed to book', err);
        }
    };

    const openBookingWithSpecialty = (specialty: string) => {
        setSelectedSpecialty(specialty);
        setShowBooking(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Appointments</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Manage your appointments</p>
                </div>
                <button onClick={() => { hapticLight(); setShowBooking(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                    <Plus className="w-4 h-4" /> Book Appointment
                </button>
            </div>

            {/* Quick Book */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl theme-card">
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Quick Book by Specialty</h2>
                <div className="flex flex-wrap gap-2">
                    {specialties.map(s => (
                        <button key={s} onClick={() => { hapticLight(); openBookingWithSpecialty(s); }}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 theme-btn-secondary">
                            {s}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2">
                {(['upcoming', 'past'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                        style={{
                            background: tab === t ? 'rgba(99,102,241,0.2)' : 'transparent',
                            color: tab === t ? 'var(--accent-indigo-light)' : 'var(--text-faint)',
                            border: `1px solid ${tab === t ? 'rgba(99,102,241,0.3)' : 'var(--card-border)'}`,
                        }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Appointments */}
            <div className="space-y-3">
                {appointments
                    .filter(a => tab === 'upcoming' ? ['CONFIRMED', 'PENDING'].includes(a.status) : a.status === 'COMPLETED')
                    .map((appt, i) => {
                        const st = statusStyle[appt.status] || { color: '#64748B', bg: 'rgba(100,116,139,0.1)' };
                        return (
                            <motion.div key={appt.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="p-5 rounded-2xl theme-card">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                                            <Calendar className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{appt.doctor?.user?.name || 'Doctor Unassigned'}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{appt.doctor?.specialization || 'General'}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>{appt.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(appt.date).toLocaleDateString()} at {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{'Consultation Room'}</span>
                                </div>
                                <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>{appt.reason || ''}</p>
                                {tab === 'upcoming' && (
                                    <div className="flex gap-2 mt-4">
                                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium theme-btn-secondary">Reschedule</button>
                                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>Cancel</button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {showBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
                        onClick={() => !bookingSuccess && setShowBooking(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg mx-4 rounded-2xl p-6 max-h-[90vh] overflow-auto"
                            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', backdropFilter: 'blur(20px)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {bookingSuccess ? (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-8">
                                    <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#10B981' }} />
                                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Appointment Booked!</h2>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        Your appointment with {selectedDoctor} has been scheduled.
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Book Appointment</h2>
                                        <button onClick={() => setShowBooking(false)} className="p-1 rounded-lg transition-all hover:scale-110"
                                            style={{ color: 'var(--text-faint)' }}>
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Specialty */}
                                        <div>
                                            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Specialty *</label>
                                            <select value={selectedSpecialty} onChange={e => { setSelectedSpecialty(e.target.value); setSelectedDoctor(''); }}
                                                className="w-full h-10 px-3 rounded-lg text-sm outline-none theme-input">
                                                <option value="">Select a specialty</option>
                                                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>

                                        {/* Doctor */}
                                        <div>
                                            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Doctor *</label>
                                            <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
                                                className="w-full h-10 px-3 rounded-lg text-sm outline-none theme-input"
                                                disabled={!selectedSpecialty}>
                                                <option value="">Select a doctor</option>
                                                {filteredDoctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
                                            </select>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Date *</label>
                                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full h-10 px-3 rounded-lg text-sm outline-none theme-input" />
                                        </div>

                                        {/* Time Slots */}
                                        <div>
                                            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Time Slot *</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {timeSlots.map(slot => (
                                                    <button key={slot} onClick={() => setSelectedTime(slot)}
                                                        className="px-2 py-2 rounded-lg text-xs font-medium transition-all"
                                                        style={{
                                                            background: selectedTime === slot ? 'rgba(99,102,241,0.2)' : 'var(--card-inner-bg)',
                                                            color: selectedTime === slot ? 'var(--accent-indigo-light)' : 'var(--text-muted)',
                                                            border: `1px solid ${selectedTime === slot ? 'rgba(99,102,241,0.3)' : 'var(--card-inner-border)'}`,
                                                        }}>
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Notes (optional)</label>
                                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                                                placeholder="Describe your symptoms or reason for visit..."
                                                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none theme-input" />
                                        </div>

                                        {/* Submit */}
                                        <button onClick={handleBook}
                                            disabled={!selectedSpecialty || !selectedDoctor || !selectedDate || !selectedTime}
                                            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                                            style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                                            Confirm Appointment
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientAppointments;
