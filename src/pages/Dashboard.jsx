import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Bell, Settings, User, Calendar,
  Clock, AlertTriangle, CheckCircle, XCircle,
  MessageSquare, Camera, MapPin, Download,
  Trash2, Lightbulb, Car, TreePine, Map, X,
  Plus, UserPlus, Edit3, Send, Archive,
  RefreshCw, ChevronDown, ChevronUp, Grid, Menu, Phone,
  Thermometer, BarChart2, Smartphone
} from 'lucide-react';
import { API_URL, USER_APP_URL } from '../config'; 

// --- STATIC DATA ---
const workers = [
  { id: 1, name: "Rajesh Patil", department: "Public Works", activeIssues: 2 },
  { id: 2, name: "Amit Kumar", department: "Sanitation", activeIssues: 1 },
  { id: 3, name: "Suresh Desai", department: "Water Works", activeIssues: 1 },
  { id: 4, name: "Deepak Singh", department: "Electrical", activeIssues: 0 }
];

const issueCategories = [
    "Roads & Traffic", "Waste & Cleanliness", "Street Lighting",
    "Stray Animals", "Illegal Construction", "Drainage & Water Logging",
    "Parks & Public Spaces", "Electrical Hazards", "Other",
];

// --- DUMMY ISSUE (Fallback) ---
const dummyResponseIssue = {
    id: 999,
    title: "Deep Potholes near College Gate",
    type: "Roads & Traffic",
    priority: "High",
    status: 'Work Completed',
    reportedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    location: { lat: 18.5196, lng: 73.8509, address: "Fergusson College Rd, Shivajinagar, Pune" },
    reporter: "Aditi Sharma",
    description: "Multiple large potholes causing traffic jams during peak hours.",
    department: "Public Works",
    assignedTo: "Rajesh Patil",
    images: 1,
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    phoneNumber: "9876543210",
    estimatedResolution: "1 Day",
    workProof: {
        summary: "Filled potholes with cold mix asphalt and compacted. Traffic flow restored.",
        imageUrl: "https://images.unsplash.com/photo-1584463635346-cfe915c2759e?auto=format&fit=crop&w=800&q=80",
        submittedBy: "Rajesh Patil",
    }
};

const transformApiReport = (report) => {
    const typeMap = {
      'Roads & Traffic': { type: 'Roads & Traffic', department: 'Public Works' },
      'Street Lighting': { type: 'Street Lighting', department: 'Electrical' },
      'Waste & Cleanliness': { type: 'Waste & Cleanliness', department: 'Sanitation' },
      'Parks & Recreation': { type: 'Parks & Public Spaces', department: 'Parks & Recreation' },
    };
    
    const categoryName = report.category?.name || 'Other';
    const typeInfo = typeMap[categoryName] || { type: categoryName, department: 'General' };
  
    const statusMap = {
      'PENDING': 'Pending', 
      'IN_PROGRESS': 'In Progress',
      'RESOLVED': 'Work Completed', 
      'VERIFIED': 'Verified', 
      'REJECTED': 'Rejected'
    };
  
    return {
      id: report.id,
      title: report.category?.name || "Civic Issue",
      type: typeInfo.type, 
      priority: "Medium", 
      status: statusMap[report.status] || 'Pending', 
      reportedAt: report.created_at,
      location: report.latitude ? { lat: parseFloat(report.latitude), lng: parseFloat(report.longitude), address: report.location_address } : null,
      reporter: "Citizen",
      description: report.description,
      department: typeInfo.department, 
      assignedTo: 'Unassigned',
      images: report.image_url ? 1 : 0, 
      imageUrl: report.image_url || "https://via.placeholder.com/400",
      phoneNumber: "N/A", 
      estimatedResolution: "N/A"
    };
};

const Dashboard = () => {
  const [issues, setIssues] = useState([]); 
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showIssueDetail, setShowIssueDetail] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('unassigned');
  
  // --- HEATMAP & MARKER STATES ---
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  
  const heatmapLayerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  // --- 1. FETCH ISSUES FROM API ---
  const fetchIssues = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reports`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const result = await response.json();
      const issuesArray = result.data || result;
      
      if (Array.isArray(issuesArray)) {
          const transformedIssues = issuesArray.map(transformApiReport);
          setIssues([...transformedIssues, dummyResponseIssue]);
      } else {
          setIssues([dummyResponseIssue]);
      }
    } catch (error) {
      console.error("Could not fetch issues:", error);
      setIssues([dummyResponseIssue]);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // --- 2. UPDATE STATUS API ---
  const handleUpdateStatus = async (issueId, newUiStatus) => {
    if (issueId === 999) {
        setIssues(prevIssues =>
            prevIssues.map(issue =>
                issue.id === issueId ? { ...issue, status: newUiStatus } : issue
            )
        );
        setShowVerificationModal(false);
        return; 
    }

    const apiStatusMap = {
      'In Progress': 'IN_PROGRESS',
      'Work Completed': 'RESOLVED',
      'Verified': 'VERIFIED',
      'Rejected': 'REJECTED'
    };
    const apiStatus = apiStatusMap[newUiStatus];
    if (!apiStatus) return;

    try {
      const response = await fetch(`${API_URL}/api/reports/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: apiStatus }),
      });
      
      if(response.ok) {
          await fetchIssues();
          setShowIssueDetail(false);
          setShowVerificationModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  
  const handleAssignIssue = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker || !selectedIssue) return;
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === selectedIssue.id ? { ...issue, assignedTo: worker.name, status: 'Assigned' } : issue
      )
    );
    setShowAssignModal(false);
  };

  // --- MAP INITIALIZATION (Run only when showMap toggles) ---
  useEffect(() => {
    if (showMap && mapRef.current && !leafletMapRef.current) {
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCss);

        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(leafletScript);

        leafletScript.onload = () => {
            const heatScript = document.createElement('script');
            heatScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
            document.head.appendChild(heatScript);
            
            heatScript.onload = () => {
                if (window.L && mapRef.current) {
                    const centerIssue = issues.find(i => i.location);
                    const center = centerIssue ? [centerIssue.location.lat, centerIssue.location.lng] : [18.5204, 73.8567];
                    leafletMapRef.current = window.L.map(mapRef.current).setView(center, 13);
                    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap'
                    }).addTo(leafletMapRef.current);
                    
                    // Trigger update manually after init
                    updateMapMarkers();
                    updateHeatmap();
                }
            };
        };
    }

    // CLEANUP: Destroy map when hidden
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        heatmapLayerRef.current = null;
        markersRef.current = [];
      }
    };
  }, [showMap]); // Intentionally exclude 'issues' so we don't destroy map on data update

  // --- MAP DATA UPDATE (Run when data changes) ---
  useEffect(() => {
    if (leafletMapRef.current && showMap) {
      updateMapMarkers();
      updateHeatmap();
    }
  }, [issues, selectedIssue, showMap, showHeatmap, showMarkers]);

  const updateMapMarkers = () => {
    if (!leafletMapRef.current || !window.L) return;
    markersRef.current.forEach(marker => leafletMapRef.current.removeLayer(marker));
    markersRef.current = [];
    if (!showMarkers) return;

    const filteredIssuesForMap = applyFilters(issues);

    filteredIssuesForMap.forEach((issue) => {
      if (!issue.location) return;
      const marker = window.L.marker([issue.location.lat, issue.location.lng]).addTo(leafletMapRef.current);
      marker.bindPopup(`<b>${issue.title}</b><br>${issue.status}`);
      marker.on('click', () => handleIssueClick(issue)); 
      markersRef.current.push(marker);
    });
  };

  const updateHeatmap = () => {
    if (!leafletMapRef.current || !window.L || !window.L.heatLayer) return;

    if (heatmapLayerRef.current) {
        leafletMapRef.current.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
    }

    if (showHeatmap) {
        const filteredIssuesForMap = applyFilters(issues);
        const heatmapPoints = filteredIssuesForMap
            .filter(issue => issue.location)
            .map(issue => [issue.location.lat, issue.location.lng, 1.0]); 

        if (heatmapPoints.length > 0) {
            heatmapLayerRef.current = window.L.heatLayer(heatmapPoints, {
                radius: 25, blur: 15, max: 1.0
            }).addTo(leafletMapRef.current);
        }
    }
  };

  // --- HELPER FUNCTIONS ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Pending Verification': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
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
           (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase())))
        );
      });
  };

  const unassignedIssuesSource = issues.filter(i => i.status === 'Pending');
  const assignedIssuesSource = issues.filter(i => i.status === 'Assigned' || i.status === 'In Progress');
  const proofOfWorkSource = issues.filter(i => i.status === 'Work Completed');
  
  const filteredUnassignedIssues = applyFilters(unassignedIssuesSource);
  const filteredAssignedIssues = applyFilters(assignedIssuesSource);
  const filteredProofOfWorkIssues = applyFilters(proofOfWorkSource);
  
  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'Pending').length,
    assigned: assignedIssuesSource.length,
    proofNeeded: proofOfWorkSource.length,
    completed: issues.filter(i => i.status === 'Verified').length,
    highPriority: issues.filter(i => i.priority === 'High').length
  };

  const handleStatClick = (statType) => {
    setFilterPriority('All'); setFilterType('All');
    switch (statType) {
      case 'pending': setFilterStatus('Pending'); setActiveTab('unassigned'); break;
      case 'assigned': setFilterStatus('Assigned'); setActiveTab('assigned'); break;
      case 'proofNeeded': setFilterStatus('Work Completed'); setActiveTab('responses'); break;
      case 'completed': setFilterStatus('Verified'); break;
      case 'highPriority': setFilterPriority('High'); setFilterStatus('All'); break;
      default: setFilterStatus('All');
    }
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    if (issue.status === 'Work Completed') {
        setShowIssueDetail(false);
        setShowVerificationModal(true);
    } else {
        setShowVerificationModal(false);
        setShowIssueDetail(true);
    }
  };

  const IssueGridCard = ({ issue }) => (
    <div onClick={() => handleIssueClick(issue)} className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getTypeIcon(issue.type)}
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{issue.title}</h3>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(issue.priority)}`}>{issue.priority}</span>
      </div>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(issue.status)}`}>{issue.status}</span>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" /><span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        <div className="flex items-center space-x-1"><User className="w-3 h-3" /><span>{issue.assignedTo}</span></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <img src="/parivartan_logo-removebg-preview.png" alt="Logo" className="h-10 w-10 object-contain"/>
                    <h1 className="text-2xl font-bold text-gray-900">Parivartan Admin</h1>
                </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* --- 1. USER VIEW SWITCH --- */}
              <a 
                href={USER_APP_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm font-medium">User App</span>
              </a>

              {/* --- 2. PERFORMANCE PAGE LINK --- */}
              <Link to="/performance" className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <BarChart2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Performance</span>
              </Link>

              <button onClick={() => setShowMap(!showMap)} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${showMap ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Map className="w-4 h-4" /><span className="text-sm font-medium">Map View</span></button>
              <div className="relative"><Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer" /><span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{stats.highPriority}</span></div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {showMap && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative z-10">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                  <h3 className="font-medium text-gray-900">Live Issue Map</h3>
                  <button onClick={() => setShowMarkers(!showMarkers)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${showMarkers ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <MapPin className="w-4 h-4" />
                      <span>{showMarkers ? 'Hide Markers' : 'Show Markers'}</span>
                  </button>
                  <button onClick={() => setShowHeatmap(!showHeatmap)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${showHeatmap ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      <Thermometer className="w-4 h-4" />
                      <span>{showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}</span>
                  </button>
              </div>
              <button onClick={() => setShowMap(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div ref={mapRef} className="w-full h-96"/>
          </div>
        )}

        {/* Stats Row */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div onClick={() => handleStatClick('total')} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"><div className="text-2xl font-bold text-gray-900">{stats.total}</div><div className="text-sm text-gray-600">Total</div></div>
            <div onClick={() => handleStatClick('pending')} className="text-center p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 cursor-pointer"><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div><div className="text-sm text-gray-600">Pending</div></div>
            <div onClick={() => handleStatClick('assigned')} className="text-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer"><div className="text-2xl font-bold text-blue-600">{stats.assigned}</div><div className="text-sm text-gray-600">Active</div></div>
            <div onClick={() => handleStatClick('proofNeeded')} className="text-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 cursor-pointer"><div className="text-2xl font-bold text-orange-600">{stats.proofNeeded}</div><div className="text-sm text-gray-600">Verify</div></div>
            <div onClick={() => handleStatClick('completed')} className="text-center p-4 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer"><div className="text-2xl font-bold text-green-600">{stats.completed}</div><div className="text-sm text-gray-600">Done</div></div>
            <div onClick={() => handleStatClick('highPriority')} className="text-center p-4 rounded-lg bg-red-50 hover:bg-red-100 cursor-pointer"><div className="text-2xl font-bold text-red-600">{stats.highPriority}</div><div className="text-sm text-gray-600">Urgent</div></div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search issues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"/></div>
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Filter className="w-4 h-4" /><span className="text-sm">Filter</span></button>
            </div>
            <button onClick={fetchIssues} className="text-gray-600 hover:text-gray-800 p-2 rounded-lg border border-gray-300 flex items-center space-x-2"><RefreshCw className="w-4 h-4" /><span>Refresh</span></button>
          </div>
          {showFilters && ( <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg"><div><label className="block text-xs font-medium text-gray-700 mb-1">Status</label><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded"><option value="All">All</option><option value="Pending">Pending</option><option value="Assigned">Assigned</option><option value="In Progress">In Progress</option><option value="Work Completed">Work Completed</option><option value="Verified">Verified</option></select></div></div>)}
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button onClick={() => setActiveTab('unassigned')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'unassigned' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Unassigned ({filteredUnassignedIssues.length})</button>
              <button onClick={() => setActiveTab('assigned')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assigned' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Assigned ({filteredAssignedIssues.length})</button>
              <button onClick={() => setActiveTab('responses')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'responses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Verification Pending ({filteredProofOfWorkIssues.length})</button>
            </nav>
          </div>
          <div className="p-6">
             <div className={'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'}>
                {activeTab === 'unassigned' && filteredUnassignedIssues.map((issue) => (<IssueGridCard key={issue.id} issue={issue} />))}
                {activeTab === 'assigned' && filteredAssignedIssues.map((issue) => (<IssueGridCard key={issue.id} issue={issue} />))}
                {activeTab === 'responses' && filteredProofOfWorkIssues.map((issue) => (<IssueGridCard key={issue.id} issue={issue} />))}
             </div>
             {((activeTab === 'unassigned' && filteredUnassignedIssues.length === 0) || 
               (activeTab === 'assigned' && filteredAssignedIssues.length === 0) ||
               (activeTab === 'responses' && filteredProofOfWorkIssues.length === 0)) && 
               <div className="text-center py-12 text-gray-500">No issues found in this category.</div>}
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showIssueDetail && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10 flex justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedIssue.title}</h2>
                <p className="text-sm text-gray-600">ID: {selectedIssue.id} • {selectedIssue.department}</p>
              </div>
              <button onClick={() => setShowIssueDetail(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                   <h3 className="font-semibold mb-2">Description</h3>
                   <p className="text-gray-700 mb-4">{selectedIssue.description}</p>
                   {selectedIssue.imageUrl && <img src={selectedIssue.imageUrl} className="w-full rounded-lg border"/>}
                </div>
                <div>
                   <h3 className="font-semibold mb-2">Location</h3>
                   <p className="text-gray-700 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4"/> {selectedIssue.location?.address || "No address"}</p>
                   {selectedIssue.status === 'Pending' && (
                        <button onClick={() => { setShowIssueDetail(false); setShowAssignModal(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">Assign Worker</button>
                   )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION MODAL */}
      {showVerificationModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
             <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
                 <h2 className="text-xl font-bold">Verify Completion</h2>
                 <button onClick={() => setShowVerificationModal(false)}><X className="w-6 h-6"/></button>
             </div>
             <div className="p-6 grid grid-cols-2 gap-6">
                 <div>
                     <h3 className="font-semibold text-gray-600">Before (Reported)</h3>
                     <img src={selectedIssue.imageUrl} className="w-full h-48 object-cover rounded-lg border mb-2"/>
                 </div>
                 <div>
                     <h3 className="font-semibold text-green-600">After (Work Proof)</h3>
                     {selectedIssue.workProof ? (
                         <>
                            <img src={selectedIssue.workProof.imageUrl} className="w-full h-48 object-cover rounded-lg border mb-2"/>
                            <p className="text-sm bg-gray-50 p-2 rounded">{selectedIssue.workProof.summary}</p>
                         </>
                     ) : (
                         <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">No Proof Uploaded</div>
                     )}
                 </div>
             </div>
             <div className="px-6 pb-6 flex gap-4">
                 <button onClick={() => handleUpdateStatus(selectedIssue.id, 'Verified')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2"><CheckCircle className="w-5 h-5"/> Verify & Close Issue</button>
                 <button onClick={() => handleUpdateStatus(selectedIssue.id, 'Rejected')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-lg font-bold">Reject & Re-open</button>
             </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Select Field Worker</h3>
            <div className="space-y-2">
              {workers.map((worker) => (
                <div key={worker.id} onClick={() => handleAssignIssue(worker.id)} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex justify-between">
                  <span>{worker.name}</span>
                  <span className="text-sm text-gray-500">{worker.department}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAssignModal(false)} className="mt-4 w-full border py-2 rounded-lg text-gray-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;