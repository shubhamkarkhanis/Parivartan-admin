// src/services/mockApi.js
export const getMockReports = async () => {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    { id: 1, title: 'Massive Pothole on FC Road', category: 'Roads', status: 'SUBMITTED', location: 'FC Road', submittedBy: 'Citizen A', createdAt: new Date() },
    { id: 2, title: 'Streetlight out near station', category: 'Streetlights', status: 'IN_PROGRESS', location: 'Pune Station', submittedBy: 'Citizen B', createdAt: new Date() },
    { id: 3, title: 'Overflowing trash bin', category: 'Sanitation', status: 'SUBMITTED', location: 'Koregaon Park', submittedBy: 'Citizen C', createdAt: new Date() },
    { id: 4, title: 'Broken pipe leaking water', category: 'Water', status: 'RESOLVED', location: 'Aundh', submittedBy: 'Citizen D', createdAt: new Date() },
  ];
};