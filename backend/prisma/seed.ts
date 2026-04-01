import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const specializations = ['Cardiology', 'Dermatology', 'Orthopedics', 'Neurology', 'Pediatrics'];
const firstNames = ['Aarav', 'Vivaan', 'Priya', 'Ananya', 'Rahul', 'Sneha', 'Vikram', 'Neha', 'Rohan', 'Isha', 'Arjun', 'Meera', 'Karan', 'Aditi', 'Siddharth', 'Kiara', 'Dev', 'Nisha', 'Rishi', 'Kavya'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Singh', 'Gupta', 'Iyer', 'Nair', 'Mehta', 'Bose'];
const conditions = ['Fever', 'Routine Checkup', 'Skin Rash', 'Knee Pain', 'Headache', 'Blood Pressure', 'Diabetes check', 'Back Pain'];

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log('Clearing old data...');
    await prisma.invoice.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.labReport.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Seeding massive realistic database...');

    const salt = await bcrypt.genSalt(10);

    // 1. Admin
    const hashedAdminPw = await bcrypt.hash('admin123', salt);
    await prisma.user.create({
        data: { name: 'Super Admin', email: 'admin@medlife.com', password: hashedAdminPw, role: 'ADMIN' },
    });
    console.log('Admin created: admin@medlife.com / admin123');

    // 2. Receptionist
    const hashedRecPw = await bcrypt.hash('receptionist123', salt);
    await prisma.user.create({
        data: { name: 'Front Desk', email: 'receptionist@medlife.com', password: hashedRecPw, role: 'RECEPTIONIST' },
    });
    console.log('Receptionist created: receptionist@medlife.com / receptionist123');

    // 3. Doctors (1 Demo + 4 others)
    const doctorUsers = [];
    for (let i = 0; i < 5; i++) {
        const docEmail = i === 0 ? 'doctor@medlife.com' : `doctor${i}@medlife.com`;
        const docName = i === 0 ? 'Dr. John Doe' : `Dr. ${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
        const docPw = await bcrypt.hash('doctor123', salt);

        const user = await prisma.user.create({
            data: { name: docName, email: docEmail, password: docPw, role: 'DOCTOR' }
        });

        const doc = await prisma.doctor.create({
            data: {
                userId: user.id,
                specialization: specializations[i],
                availability: JSON.stringify({ Monday: ["09:00", "17:00"], Tuesday: ["09:00", "17:00"], Wednesday: ["09:00", "17:00"], Thursday: ["09:00", "17:00"], Friday: ["09:00", "13:00"] })
            }
        });
        doctorUsers.push(doc);
    }
    console.log('5 Doctors generated.');

    // 4. Patients (1 Demo + 19 others)
    const patientUsers = [];
    for (let i = 0; i < 20; i++) {
        const patEmail = i === 0 ? 'patient@medlife.com' : `patient${i}@medlife.com`;
        const patName = i === 0 ? 'Jane Smith' : `${firstNames[i]} ${getRandomItem(lastNames)}`;
        const patPw = await bcrypt.hash('patient123', salt);

        const user = await prisma.user.create({
            data: { name: patName, email: patEmail, password: patPw, role: 'PATIENT' }
        });

        const pat = await prisma.patient.create({
            data: {
                userId: user.id,
                dob: randomDate(new Date(1950, 0, 1), new Date(2010, 0, 1)),
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                bloodGroup: getRandomItem(['A+', 'O+', 'B+', 'AB+', 'O-']),
                address: `${Math.floor(Math.random() * 999)} Main St, City`,
            }
        });
        patientUsers.push(pat);
    }
    console.log('20 Patients generated.');

    // 5. Appointments, Invoices, Prescriptions
    const now = new Date();
    let totalAppointments = 0;
    
    for (const patient of patientUsers) {
        // Every patient gets 1-4 appointments
        const numAppts = Math.floor(Math.random() * 4) + 1;
        
        for (let j = 0; j < numAppts; j++) {
            const doctor = getRandomItem(doctorUsers);
            const isPast = Math.random() > 0.4;
            let date;
            let status;
            
            if (isPast) {
                date = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now);
                status = 'COMPLETED';
            } else {
                date = randomDate(now, new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000));
                status = Math.random() > 0.8 ? 'PENDING' : 'CONFIRMED';
            }
            
            // Generate valid appointment times (9 AM - 4 PM)
            date.setHours(9 + Math.floor(Math.random() * 7), Math.random() > 0.5 ? 0 : 30, 0, 0);

            const appt = await prisma.appointment.create({
                data: {
                    patientId: patient.id,
                    doctorId: doctor.id,
                    date: date,
                    reason: getRandomItem(conditions),
                    status: status
                }
            });
            totalAppointments++;

            if (status === 'COMPLETED') {
                // Generate Invoice
                const price = Math.floor(Math.random() * 400) * 10 + 500; // 500 to 4500
                await prisma.invoice.create({
                    data: {
                        patientId: patient.id,
                        appointmentId: appt.id,
                        totalAmount: price,
                        status: 'PAID',
                        items: JSON.stringify([{ description: 'Consultation Fee', amount: price }])
                    }
                });

                // Generate Prescription
                if (Math.random() > 0.3) {
                    await prisma.prescription.create({
                        data: {
                            appointmentId: appt.id,
                            doctorId: doctor.id,
                            patientId: patient.id,
                            notes: "Take complete rest and drink water.",
                            medicines: JSON.stringify([
                                { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Twice a day for 3 days' },
                                { name: 'Vitamin C', dosage: '1 tablet', frequency: 'Once a day' }
                            ])
                        }
                    });
                }
            }
        }
    }
    console.log(`Generated ${totalAppointments} appointments along with invoices and prescriptions.`);
    console.log('✔ Database seeded successfully with massive realistic data!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
