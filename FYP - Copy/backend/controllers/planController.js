const getPlans = (req, res) => {
  return res.json({
    data: {
      plans: [
        {
          id: "basic",
          name: "Free",
          tag: "Starter",
          price: "Free",
          description: "Essential tools for patients who want simple health tracking.",
          features: [
            "Manual vitals entry",
            "AI health assistant",
            "Book doctor or nurse appointments",
            "SOS location sharing",
          ],
        },
        {
          id: "standard",
          name: "Standard",
          tag: "Popular",
          price: "PKR 999/mo",
          description: "Better follow-up and family coordination for regular care needs.",
          features: [
            "Everything in Free",
            "Medication reminders",
            "Saved family emergency contacts",
            "Appointment payment history",
            "Priority support responses",
          ],
        },
        {
          id: "premium",
          name: "Premium",
          tag: "Advanced",
          price: "PKR 2,499/mo",
          description: "Full care support for patients who need closer monitoring.",
          features: [
            "Everything in Standard",
            "24/7 emergency escalation",
            "Doctor and nurse care coordination",
            "Monthly health summary reports",
            "Premium telehealth support",
          ],
        },
        {
          id: "caregiver-plus",
          name: "Caregiver Plus",
          tag: "Service",
          price: "$49.99/mo",
          description: "Add professional caregiver support and in-app scheduling.",
          features: [
            "Caregiver scheduling",
            "In-app communication",
            "Service history reports",
          ],
        },
      ],
      addOnServices: [
        {
          id: "telehealth",
          title: "Telehealth Consultations",
          description: "Connect with doctors via video call for remote appointments.",
        },
        {
          id: "nutrition",
          title: "Nutrition Planning",
          description: "Personalized meal plans and diet tracking for better wellness.",
        },
        {
          id: "physio",
          title: "Physical Therapy Support",
          description: "Schedule in-home or virtual physiotherapy sessions for elder care.",
        },
      ],
    },
  });
};

module.exports = {
  getPlans,
};
