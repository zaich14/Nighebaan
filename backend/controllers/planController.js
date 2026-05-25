const getPlans = (req, res) => {
  return res.json({
    data: {
      plans: [
        {
          id: "basic",
          name: "Basic",
          tag: "Starter",
          price: "Free",
          description: "Essential care tracking for individuals getting started.",
          features: [
            "Manual health entry",
            "Family dashboard access",
            "Basic notifications",
          ],
        },
        {
          id: "standard",
          name: "Standard",
          tag: "Popular",
          price: "$14.99/mo",
          description: "Real-time monitoring and caregiver coordination for growing care needs.",
          features: [
            "Health alerts",
            "Medication reminders",
            "Care team sharing",
          ],
        },
        {
          id: "premium",
          name: "Premium",
          tag: "Advanced",
          price: "$29.99/mo",
          description: "Full-service elder care management with emergency support.",
          features: [
            "24/7 monitoring",
            "Emergency SOS",
            "Doctor connectivity",
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
