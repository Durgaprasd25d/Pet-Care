const cron = require('node-cron');
const Vaccination = require('../models/Vaccination');
const Pet = require('../models/Pet');
const NotificationService = require('./notificationService');

const startCronJobs = () => {
  console.log('[CronService] ⏰ Starting background cron jobs...');

  // Run every day at 08:00 AM server time
  // This will check all vaccinations to see if any are due within the next 24 to 48 hours
  cron.schedule('0 8 * * *', async () => {
    console.log('[CronService] Running daily vaccination check...');
    try {
      const today = new Date();
      // Look forward 24 hours
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Look forward 48 hours to bound the search to just 1 day's worth
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      dayAfterTomorrow.setHours(0, 0, 0, 0);

      const upcomingVaccinations = await Vaccination.find({
        nextDueDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        }
      }).populate('petId');

      if (upcomingVaccinations.length > 0) {
        console.log(`[CronService] Found ${upcomingVaccinations.length} pets needing vaccines tomorrow.`);
        
        for (const vac of upcomingVaccinations) {
          if (vac.petId && vac.petId.ownerId) {
            await NotificationService.sendToUser(vac.petId.ownerId.toString(), {
              title: "Vaccination Reminder! 💉",
              body: `Reminder: ${vac.petId.name}'s ${vac.vaccineType} vaccination is due tomorrow.`,
              data: { type: 'vaccination_reminder', petId: vac.petId._id.toString() }
            });
          }
        }
      }
    } catch (error) {
      console.error('[CronService] Error in vaccination cron:', error.message);
    }
  });
};

module.exports = { startCronJobs };
