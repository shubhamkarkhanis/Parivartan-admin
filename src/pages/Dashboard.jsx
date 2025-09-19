import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Bell, 
  Settings, 
  User, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Camera,
  MapPin,
  BarChart3,
  Download,
  Trash2,
  Lightbulb,
  Car,
  TreePine,
  Map,
  X,
  Plus,
  UserPlus,
  Edit3,
  Send,
  Archive,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Grid,
  Menu,
  Phone
} from 'lucide-react';

const initialIssues = [
  {
    id: 1,
    title: "Pothole on Main Street",
    type: "Roads & Traffic", // Updated to match new categories
    priority: "High",
    status: "Pending",
    reportedAt: "2025-09-19T14:30:00Z",
    location: { lat: 18.5679, lng: 73.9143, address: "Main Street, Near Bus Stop, Pimpri" },
    reporter: "John Doe",
    description: "Large pothole causing traffic issues",
    department: "Public Works",
    assignedTo: "Unassigned",
    images: 2,
    phoneNumber: "+91 98765 43210",
    estimatedResolution: "2-3 hours"
  },
  {
    id: 2,
    title: "Broken Streetlight",
    type: "Street Lighting", // Updated to match new categories
    priority: "Medium",
    status: "Pending",
    reportedAt: "2025-09-19T09:15:00Z",
    location: { lat: 18.5694, lng: 73.9125, address: "Park Avenue, Chinchwad" },
    reporter: "Jane Smith",
    description: "Street light not working since last week",
    department: "Electrical",
    assignedTo: "Unassigned",
    images: 1,
    phoneNumber: "+91 87654 32109",
    estimatedResolution: "1-2 hours"
  },
  {
    id: 3,
    title: "Overflowing Trash Bin",
    type: "Waste & Cleanliness", // Updated to match new categories
    priority: "Low",
    status: "Pending",
    reportedAt: "2025-09-18T16:45:00Z",
    location: { lat: 18.5661, lng: 73.9158, address: "City Park, Pimpri" },
    reporter: "Sam Wilson",
    description: "Trash bin overflowing near park entrance",
    department: "Sanitation",
    assignedTo: "Unassigned",
    images: 3,
    phoneNumber: "+91 76543 21098",
    estimatedResolution: "30 minutes"
  },
  {
    id: 4,
    title: "Water Leak on Street",
    type: "Drainage & Water Logging", // Updated to match new categories
    priority: "High",
    status: "Pending",
    reportedAt: "2025-09-17T11:20:00Z",
    location: { lat: 18.5671, lng: 73.9135, address: "Commercial Street, Pimpri" },
    reporter: "Priya Sharma",
    description: "Water pipe burst causing road flooding",
    department: "Water Works",
    assignedTo: "Unassigned",
    images: 1,
    phoneNumber: "+91 98234 56789",
    estimatedResolution: "4-6 hours"
  }
];

const workers = [
  { id: 1, name: "Rajesh Patil", department: "Public Works", activeIssues: 2 },
  { id: 2, name: "Amit Kumar", department: "Sanitation", activeIssues: 1 },
  { id: 3, name: "Suresh Desai", department: "Water Works", activeIssues: 1 },
  { id: 4, name: "Deepak Singh", department: "Electrical", activeIssues: 0 }
];

// --- CHANGE 1: New array for the filter dropdown based on your screenshot ---
const issueCategories = [
    "Roads & Traffic",
    "Waste & Cleanliness",
    "Street Lighting",
    "Stray Animals",
    "Illegal Construction",
    "Drainage & Water Logging",
    "Parks & Public Spaces",
    "Electrical Hazards",
    "Other",
];

const Dashboard = () => {
  const [issues, setIssues] = useState(initialIssues);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showMap, setShowMap] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showIssueDetail, setShowIssueDetail] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Assigned': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'In Progress': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Work Completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'Verified': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Roads & Traffic': return <Car className="w-4 h-4" />;
      case 'Street Lighting': return <Lightbulb className="w-4 h-4" />;
      case 'Waste & Cleanliness': return <Trash2 className="w-4 h-4" />;
      case 'Parks & Public Spaces': return <TreePine className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const applyFilters = (issueList) => {
    return issueList.filter(issue => {
        return (
          (filterStatus === 'All' || issue.status === filterStatus) &&
          (filterPriority === 'All' || issue.priority === filterPriority) &&
          (filterType === 'All' || issue.type === filterType) &&
          (issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           issue.location.address.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
  };

  const allUnassignedIssues = issues.filter(i => i.assignedTo === 'Unassigned');
  const allAssignedIssues = issues.filter(i => i.assignedTo !== 'Unassigned');

  const filteredUnassignedIssues = applyFilters(allUnassignedIssues);
  const filteredAssignedIssues = applyFilters(allAssignedIssues);

  const filteredIssuesForMap = applyFilters(issues);

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'Pending').length,
    assigned: issues.filter(i => i.status === 'Assigned' || i.status === 'In Progress' || i.status === 'Work Completed').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    completed: issues.filter(i => i.status === 'Work Completed').length,
    highPriority: issues.filter(i => i.priority === 'High').length
  };

  const handleStatClick = (statType) => {
    switch (statType) {
      case 'pending':
        setFilterStatus('Pending');
        break;
      case 'assigned':
        setFilterStatus('Assigned');
        break;
      case 'inProgress':
        setFilterStatus('In Progress');
        break;
      case 'completed':
        setFilterStatus('Work Completed');
        break;
      case 'highPriority':
        setFilterPriority('High');
        setFilterStatus('All');
        break;
      default:
        setFilterStatus('All');
        setFilterPriority('All');
    }
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setShowIssueDetail(true);
  };

  useEffect(() => {
    if (showMap && mapRef.current && !leafletMapRef.current) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        if (window.L && mapRef.current) {
          leafletMapRef.current = window.L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true
          }).setView([18.5679, 73.9143], 13);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
          }).addTo(leafletMapRef.current);

          updateMapMarkers();
        }
      };
      document.head.appendChild(script);
    }
  }, [showMap]);

  useEffect(() => {
    if (leafletMapRef.current && window.L && showMap) {
      updateMapMarkers();
    }
  }, [filteredIssuesForMap, selectedIssue, showMap]);

  const updateMapMarkers = () => {
    if (!leafletMapRef.current || !window.L) return;

    markersRef.current.forEach(marker => {
      leafletMapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    filteredIssuesForMap.forEach((issue) => {
      const iconColor = getMarkerColor(issue.status);
      const customIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = window.L.marker([issue.location.lat, issue.location.lng], {
        icon: customIcon
      }).addTo(leafletMapRef.current);
      
      const popupContent = `
        <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${issue.title}</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">${issue.description}</p>
          <div style="display: flex; gap: 8px;">
            <span style="padding: 2px 8px; font-size: 11px; border-radius: 12px; background-color: ${getStatusBgColor(issue.status)}; color: ${getStatusTextColor(issue.status)};">${issue.status}</span>
            <span style="padding: 2px 8px; font-size: 11px; border-radius: 12px; background-color: ${getPriorityBgColor(issue.priority)}; color: ${getPriorityTextColor(issue.priority)};">${issue.priority}</span>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      marker.on('click', () => handleIssueClick(issue));
      
      markersRef.current.push(marker);
    });
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Assigned': return '#3b82f6';
      case 'In Progress': return '#8b5cf6';
      case 'Work Completed': return '#10b981';
      case 'Verified': return '#059669';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Pending': return '#fef3c7';
      case 'Assigned': return '#dbeafe';
      case 'In Progress': return '#e9d5ff';
      case 'Work Completed': return '#d1fae5';
      case 'Verified': return '#a7f3d0';
      default: return '#f3f4f6';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Pending': return '#d97706';
      case 'Assigned': return '#2563eb';
      case 'In Progress': return '#7c3aed';
      case 'Work Completed': return '#059669';
      case 'Verified': return '#047857';
      default: return '#4b5563';
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority) {
      case 'High': return '#fee2e2';
      case 'Medium': return '#fed7aa';
      case 'Low': return '#d1fae5';
      default: return '#f3f4f6';
    }
  };

  const getPriorityTextColor = (priority) => {
    switch (priority) {
      case 'High': return '#dc2626';
      case 'Medium': return '#ea580c';
      case 'Low': return '#059669';
      default: return '#4b5563';
    }
  };

  const handleAssignIssue = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker || !selectedIssue) return;

    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === selectedIssue.id 
          ? { ...issue, assignedTo: worker.name, status: 'Assigned' } 
          : issue
      )
    );
    
    setSelectedIssue(prev => ({
        ...prev,
        assignedTo: worker.name,
        status: 'Assigned'
    }));

    setShowAssignModal(false);
    alert(`Issue assigned to ${worker.name}`);
  };

  const IssueGridCard = ({ issue }) => (
    <div
      onClick={() => handleIssueClick(issue)}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getTypeIcon(issue.type)}
          <h3 className="font-semibold text-gray-900 text-sm">{issue.title}</h3>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(issue.priority)}`}>
          {issue.priority}
        </span>
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(issue.status)}`}>
          {issue.status}
        </span>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {issue.images > 0 && (
            <div className="flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span>{issue.images}</span>
            </div>
          )}
          <Clock className="w-3 h-3" />
          <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <div className="flex items-center space-x-1 mb-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{issue.location.address}</span>
        </div>
        <div className="flex items-center space-x-1">
          <User className="w-3 h-3" />
          <span>{issue.assignedTo}</span>
        </div>
      </div>
    </div>
  );

  const IssueListRow = ({ issue }) => (
    <div
      onClick={() => handleIssueClick(issue)}
      className="bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm hover:border-blue-300"
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 flex items-center space-x-2">
          {getTypeIcon(issue.type)}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{issue.title}</h3>
            <p className="text-xs text-gray-600">#{issue.id}</p>
          </div>
        </div>
        
        <div className="col-span-2">
          <p className="text-xs text-gray-600 line-clamp-2">{issue.description}</p>
        </div>
        
        <div className="col-span-2">
          <p className="text-xs text-gray-600">{issue.location.address}</p>
        </div>
        
        <div className="col-span-1">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(issue.priority)}`}>
            {issue.priority}
          </span>
        </div>
        
        <div className="col-span-1">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(issue.status)}`}>
            {issue.status}
          </span>
        </div>
        
        <div className="col-span-2">
          <p className="text-xs text-gray-600">{issue.assignedTo}</p>
        </div>
        
        <div className="col-span-1 text-right">
          <p className="text-xs text-gray-500">{new Date(issue.reportedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Civic Dashboard</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>Pimpri-Chinchwad Municipal Corporation</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  showMap 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="text-sm font-medium">Map View</span>
              </button>
              
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.highPriority}
                </span>
              </div>
              
              <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors">
                <User className="w-5 h-5 text-gray-600" />
                <span className="hidden md:block text-sm font-medium text-gray-700">Admin User</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {showMap && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative z-10">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Issue Locations Map</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div 
              ref={mapRef}
              className="w-full h-96"
            />
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div 
              onClick={() => handleStatClick('total')}
              className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
            <div 
              onClick={() => handleStatClick('pending')}
              className="text-center p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition-colors"
            >
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div 
              onClick={() => handleStatClick('assigned')}
              className="text-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
            >
              <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
              <div className="text-sm text-gray-600">Assigned</div>
            </div>
            <div 
              onClick={() => handleStatClick('inProgress')}
              className="text-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors"
            >
              <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div 
              onClick={() => handleStatClick('completed')}
              className="text-center p-4 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors"
            >
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div 
              onClick={() => handleStatClick('highPriority')}
              className="text-center p-4 rounded-lg bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
            >
              <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4 inline mr-1" />
                New Issue
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Work Completed">Work Completed</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                {/* --- CHANGE 2: The dropdown now generates options dynamically --- */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Types</option>
                  {issueCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                    All Issues ({filteredUnassignedIssues.length})
                    </h2>
                </div>

                <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' 
                    : 'space-y-3'
                }>
                    {filteredUnassignedIssues.map((issue) => (
                    viewMode === 'grid' 
                        ? <IssueGridCard key={issue.id} issue={issue} />
                        : <IssueListRow key={issue.id} issue={issue} />
                    ))}
                </div>

                {filteredUnassignedIssues.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No unassigned issues found.</div>
                )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                    Assigned Issues ({filteredAssignedIssues.length})
                    </h2>
                </div>

                <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' 
                    : 'space-y-3'
                }>
                    {filteredAssignedIssues.map((issue) => (
                    viewMode === 'grid' 
                        ? <IssueGridCard key={issue.id} issue={issue} />
                        : <IssueListRow key={issue.id} issue={issue} />
                    ))}
                </div>
                 {filteredAssignedIssues.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No assigned issues found.</div>
                )}
            </div>
        </div>
      </div>

      {showIssueDetail && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(selectedIssue.type)}
                    <h2 className="text-xl font-bold text-gray-900">{selectedIssue.title}</h2>
                  </div>
                  <p className="text-sm text-gray-600">#{selectedIssue.id} • {selectedIssue.department}</p>
                </div>
                <button
                  onClick={() => setShowIssueDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex space-x-2 mt-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedIssue.status)}`}>
                  {selectedIssue.status}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(selectedIssue.priority)}`}>
                  {selectedIssue.priority}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700">{selectedIssue.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{selectedIssue.location.address}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Reporter Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Name</div>
                          <div className="font-medium text-gray-900">{selectedIssue.reporter}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="font-medium text-gray-900 flex items-center space-x-2">
                            <span>{selectedIssue.phoneNumber}</span>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Reported Date</div>
                          <div className="font-medium text-gray-900">{new Date(selectedIssue.reportedAt).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Estimated Resolution</div>
                          <div className="font-medium text-gray-900">{selectedIssue.estimatedResolution}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {selectedIssue.images > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Reported Images ({selectedIssue.images})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Array(selectedIssue.images).fill(0).map((_, index) => (
                          <div key={index} className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      {selectedIssue.assignedTo === 'Unassigned' && (
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Assign Worker</span>
                        </button>
                      )}
                      <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2">
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Issue</span>
                      </button>
                      {selectedIssue.assignedTo !== 'Unassigned' && (
                        <button className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark as Verified</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Assignment</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-500">Assigned To</div>
                        {selectedIssue.assignedTo === 'Unassigned' && (
                          <button
                            onClick={() => setShowAssignModal(true)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Assign Now
                          </button>
                        )}
                      </div>
                      <div className="font-medium text-gray-900 flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{selectedIssue.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">More Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Add Comment</span>
                      </button>
                      <button className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Download Report</span>
                      </button>
                      <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2">
                        <Archive className="w-4 h-4" />
                        <span>Archive Issue</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Issue reported</div>
                          <div className="text-xs text-gray-500">{new Date(selectedIssue.reportedAt).toLocaleString()}</div>
                        </div>
                      </div>
                      {selectedIssue.assignedTo !== 'Unassigned' && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">Assigned to {selectedIssue.assignedTo}</div>
                            <div className="text-xs text-gray-500">Just now</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Issue</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Assign "{selectedIssue?.title}" to a field worker:
              </p>
            </div>
            <div className="space-y-2 mb-6">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => handleAssignIssue(worker.id)}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{worker.name}</div>
                      <div className="text-sm text-gray-500">{worker.department}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {worker.activeIssues} active issues
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;