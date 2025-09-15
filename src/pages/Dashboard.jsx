import React, { useState } from 'react';
import { 
  MapPin, Trash2, AlertTriangle, Users, Bell, Filter, Download, Calendar, Plus, Minus, Settings, LogOut 
} from 'lucide-react';

// STEP 1: ADD THESE IMPORTS FOR THE REAL MAP
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // <-- This is the crucial CSS import
import L from 'leaflet'; // <-- Import Leaflet library

// This is a common fix for the default marker icon issue with bundlers like Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Mock data for issues (no changes needed here)
const mockIssues = [
  { id: 1, title: 'Pothole on Main Street', description: 'Large pothole causing traffic issues', priority: 'High', status: 'In Progress', reports: 2, date: '10/9/2025', location: { lat: 18.5204, lng: 73.8567 }, type: 'road' },
  { id: 2, title: 'Broken Streetlight', description: 'Street light not working since last week', priority: 'Medium', status: 'Pending', reports: 1, date: '10/9/2025', location: { lat: 18.5304, lng: 73.8467 }, type: 'utility' },
  { id: 3, title: 'Overflowing Trash Bin', description: 'Trash bin overflowing near park entrance', priority: 'Low', status: 'Resolved', reports: 3, date: '9/9/2025', location: { lat: 18.5104, lng: 73.8667 }, type: 'sanitation' },
  { id: 4, title: 'Water Pipe Leak', description: 'Major water leak affecting multiple households', priority: 'High', status: 'In Progress', reports: 5, date: '11/9/2025', location: { lat: 18.5404, lng: 73.8367 }, type: 'utility' },
  { id: 5, title: 'Road Construction Delay', description: 'Construction work behind schedule causing traffic', priority: 'Medium', status: 'Pending', reports: 8, date: '8/9/2025', location: { lat: 18.5004, lng: 73.8767 }, type: 'road' }
];

// STEP 2: REPLACE THE OLD MapComponent WITH THIS NEW, REAL ONE
const MapComponent = ({ issues, selectedIssue, onIssueSelect }) => {
  // Use the location of the first issue as the map's center, or default to Pune
  const mapCenter = issues.length > 0 ? [issues[0].location.lat, issues[0].location.lng] : [18.5204, 73.8567];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {issues.map(issue => (
          <Marker 
            key={issue.id} 
            position={[issue.location.lat, issue.location.lng]}
            eventHandlers={{
              click: () => {
                onIssueSelect(issue);
              },
            }}
          >
            <Popup>
              <strong>{issue.title}</strong><br />
              Priority: {issue.priority}<br />
              Status: {issue.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};


// The rest of your Dashboard component remains exactly the same
const Dashboard = ({ user, onLogout }) => {
  const [issues, setIssues] = useState(mockIssues);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || issue.priority === filterPriority;
    const matchesStatus = !filterStatus || issue.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Resolved': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'road': return <AlertTriangle className="w-4 h-4" />;
      case 'utility': return <MapPin className="w-4 h-4" />;
      case 'sanitation': return <Trash2 className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const stats = {
    total: issues.length,
    high: issues.filter(i => i.priority === 'High').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Civic Dashboard</h1>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {user.name.charAt(0)}
              </div>
              <span className="text-gray-600">Welcome, {user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800" />
              <LogOut 
                onClick={onLogout}
                className="w-4 h-4 text-gray-600 cursor-pointer hover:text-red-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">{stats.high}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </span>
            <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          
          <div className="flex gap-2">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            >
              <option value="">All Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Issues ({filteredIssues.length})</h2>
            </div>
            
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <div 
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedIssue?.id === issue.id 
                      ? 'border-primary-500 bg-primary-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {getStatusIcon(issue.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {issue.reports} reports
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {issue.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Map */}
      <div className="flex-1 p-6">
        <div className="h-full rounded-lg overflow-hidden shadow-lg">
          <MapComponent 
            issues={filteredIssues}
            selectedIssue={selectedIssue}
            onIssueSelect={setSelectedIssue}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;