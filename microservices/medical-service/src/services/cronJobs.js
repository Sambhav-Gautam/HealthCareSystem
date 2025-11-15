const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { sendAppointmentReminder, sendDailyDoctorDigest } = require('./emailService');

const startCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily appointment reminder job...');
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        date: { $gte: tomorrow, $lt: dayAfterTomorrow },
        status: { $in: ['scheduled', 'confirmed'] },
        reminderSent: false,
      })
        .populate('patientId')
        .populate('doctorId');

      for (const appointment of appointments) {
        await sendAppointmentReminder(
          appointment,
          appointment.patientId,
          appointment.doctorId
        );
        
        appointment.reminderSent = true;
        await appointment.save();
      }

      console.log(`Sent ${appointments.length} appointment reminders`);
    } catch (error) {
      console.error('Error in appointment reminder job:', error);
    }
  });

  cron.schedule('0 7 * * *', async () => {
    console.log('Running daily doctor digest job...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all doctors from Doctor model
      const doctors = await Doctor.find({}).populate('userId');

      for (const doctor of doctors) {
        if (!doctor.userId) {
          console.warn(`Doctor ${doctor._id} has no associated user, skipping...`);
          continue;
        }

        const appointmentsToday = await Appointment.find({
          doctorId: doctor._id,
          date: { $gte: today, $lt: tomorrow },
          status: { $in: ['scheduled', 'confirmed'] },
        })
          .populate('patientId')
          .sort({ startTime: 1 });

        if (appointmentsToday.length > 0) {
          await sendDailyDoctorDigest(doctor, appointmentsToday);
        }
      }

      console.log(`Sent daily digest to ${doctors.length} doctors`);
    } catch (error) {
      console.error('Error in daily doctor digest job:', error);
    }
  });

  console.log('Cron jobs started successfully');
};

module.exports = { startCronJobs };




