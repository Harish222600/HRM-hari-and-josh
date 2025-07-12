import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { teamAPI, userAPI, departmentAPI } from '../../utils/api';

const TeamManagement = () => {
  const { user, hasAnyRole } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeams, setTotalTeams] = useState(0);

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamManagers, setTeamManagers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [addFormData, setAddFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    teamManager: '',
    teamLeader: '',
    maxSize: 10
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    teamManager: '',
    teamLeader: '',
    maxSize: 10,
    isActive: true
  });

  const [memberFormData, setMemberFormData] = useState({
    userId: '',
    role: 'Member'
  });

  // Check if user can create/edit teams
  const canCreateTeams = hasAnyRole(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']);
  const canManageAllTeams = hasAnyRole(['Admin', 'Vice President', 'HR BP', 'HR Manager', 'HR Executive']);
  const isTeamManager = user?.role === 'Team Manager';
  const isTeamLeader = user?.role === 'Team Leader';

  useEffect(() => {
    fetchTeams();
    fetchDepartments();
    fetchUsers();
  }, [currentPage, searchTerm, departmentFilter, statusFilter]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        department: departmentFilter
      };

      // Only add isActive filter if statusFilter is not empty
      if (statusFilter !== '') {
        params.isActive = statusFilter;
      }

      console.log('Fetching teams with params:', params);
      const response = await teamAPI.getAllTeams(params);
      console.log('Teams API response:', response.data);
      console.log('Teams array length:', response.data.teams?.length);
      console.log('Teams data:', JSON.stringify(response.data.teams, null, 2));
      
      if (response.data.success) {
        console.log('Setting teams - count:', response.data.teams?.length);
        console.log('Setting total teams:', response.data.total);
        setTeams(response.data.teams || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalTeams(response.data.total || 0);
        console.log('Teams state should be updated now');
      } else {
        console.error('API response success is false:', response.data);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments for team modal...');
      const response = await departmentAPI.getAllDepartments({ limit: 100 });
      console.log('Department API response:', response.data);
      if (response.data.departments) {
        setDepartments(response.data.departments);
        console.log('Departments set:', response.data.departments);
      } else {
        console.error('No departments found in response');
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers({ limit: 1000 });
      if (response.data.success) {
        setUsers(response.data.users);
        setTeamManagers(response.data.users.filter(u => u.role === 'Team Manager'));
        setTeamLeaders(response.data.users.filter(u => u.role === 'Team Leader'));
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (e) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setAddFormData({
      name: '',
      code: '',
      description: '',
      department: '',
      teamManager: '',
      teamLeader: '',
      maxSize: 10
    });
    setValidationErrors({});
    setShowAddModal(true);
  };

  const handleAddInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMemberInputChange = (e) => {
    const { name, value } = e.target;
    setMemberFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setEditFormData({
      name: team.name || '',
      description: team.description || '',
      teamManager: team.teamManager?._id || '',
      teamLeader: team.teamLeader?._id || '',
      maxSize: team.maxSize || 10,
      isActive: team.isActive !== undefined ? team.isActive : true
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  const handleManageMembers = (team) => {
    setSelectedTeam(team);
    setMemberFormData({
      userId: '',
      role: 'Member'
    });
    setShowMembersModal(true);
  };

  const validateAddForm = () => {
    const errors = {};
    
    if (!addFormData.name.trim()) {
      errors.name = 'Team name is required';
    }
    
    if (!addFormData.code.trim()) {
      errors.code = 'Team code is required';
    } else if (!/^[A-Z0-9]+$/.test(addFormData.code)) {
      errors.code = 'Team code must contain only uppercase letters and numbers';
    }
    
    if (!addFormData.department) {
      errors.department = 'Department is required';
    }
    
    if (addFormData.maxSize < 1 || addFormData.maxSize > 50) {
      errors.maxSize = 'Max size must be between 1 and 50';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (canManageAllTeams && !editFormData.name.trim()) {
      errors.name = 'Team name is required';
    }
    
    if (editFormData.maxSize < 1 || editFormData.maxSize > 50) {
      errors.maxSize = 'Max size must be between 1 and 50';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.response?.data) {
      const data = error.response.data;
      
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.map(err => err.msg || err.message).join(', ');
      }
      
      if (data.message) {
        return data.message;
      }
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    
    if (!validateAddForm()) {
      return;
    }
    
    try {
      setError('');
      setSuccess('');

      const teamData = {
        name: addFormData.name.trim(),
        code: addFormData.code.trim().toUpperCase(),
        description: addFormData.description.trim(),
        department: addFormData.department,
        teamManager: addFormData.teamManager || null,
        teamLeader: addFormData.teamLeader || null,
        maxSize: parseInt(addFormData.maxSize)
      };

      const response = await teamAPI.createTeam(teamData);
      
      if (response.data.success) {
        setShowAddModal(false);
        setAddFormData({
          name: '',
          code: '',
          description: '',
          department: '',
          teamManager: '',
          teamLeader: '',
          maxSize: 10
        });
        setValidationErrors({});
        setSuccess('Team created successfully!');
        fetchTeams();
      }
    } catch (err) {
      console.error('Create team error:', err);
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }
    
    try {
      setError('');
      setSuccess('');

      const teamData = {
        description: editFormData.description.trim(),
        maxSize: parseInt(editFormData.maxSize)
      };

      // Only Admin/HR can update these fields
      if (canManageAllTeams) {
        teamData.name = editFormData.name.trim();
        teamData.teamManager = editFormData.teamManager || null;
        teamData.teamLeader = editFormData.teamLeader || null;
        teamData.isActive = editFormData.isActive;
      }

      const response = await teamAPI.updateTeam(editingTeam._id, teamData);
      
      if (response.data.success) {
        setShowEditModal(false);
        setEditingTeam(null);
        setValidationErrors({});
        setSuccess('Team updated successfully!');
        fetchTeams();
      }
    } catch (err) {
      console.error('Update team error:', err);
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteTeam = async (team) => {
    if (window.confirm(`Are you sure you want to delete team "${team.name}"? This action cannot be undone.`)) {
      try {
        setError('');
        setSuccess('');

        const response = await teamAPI.deleteTeam(team._id);
        if (response.data.success) {
          setSuccess('Team deleted successfully!');
          fetchTeams();
        }
      } catch (err) {
        console.error('Delete team error:', err);
        setError(getErrorMessage(err));
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!memberFormData.userId) {
      setError('Please select a user to add');
      return;
    }
    
    try {
      setError('');
      setSuccess('');

      const response = await teamAPI.addTeamMember(selectedTeam._id, {
        userId: memberFormData.userId,
        role: memberFormData.role
      });
      
      if (response.data.success) {
        setSuccess('Member added successfully!');
        setMemberFormData({ userId: '', role: 'Member' });
        
        // Update the selected team with new member data
        setSelectedTeam(response.data.team);
        fetchTeams();
      }
    } catch (err) {
      console.error('Add member error:', err);
      setError(getErrorMessage(err));
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        setError('');
        setSuccess('');

        const response = await teamAPI.removeTeamMember(selectedTeam._id, userId);
        
        if (response.data.success) {
          setSuccess('Member removed successfully!');
          
          // Update the selected team with updated member data
          setSelectedTeam(response.data.team);
          fetchTeams();
        }
      } catch (err) {
        console.error('Remove member error:', err);
        setError(getErrorMessage(err));
      }
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const canEditTeam = (team) => {
    return canManageAllTeams || 
           (isTeamManager && team.teamManager && team.teamManager._id === user._id);
  };

  const canManageTeamMembers = (team) => {
    return canManageAllTeams || 
           (isTeamManager && team.teamManager && team.teamManager._id === user._id);
  };

  if (loading && teams.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Team Management</h2>
          <p className="text-muted">
            {isTeamLeader ? 'View your team details' : 
             isTeamManager ? 'Manage your assigned teams' : 
             'Manage all teams and their members'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary fs-6">{totalTeams} Total Teams</span>
          {canCreateTeams && (
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <i className="bi bi-plus-circle me-1"></i> Add Team
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccess('')}
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search Teams</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, code, or description..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Filter by Department</label>
              <select
                className="form-select"
                value={departmentFilter}
                onChange={handleDepartmentFilter}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Filter by Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No teams found</h5>
              <p className="text-muted">
                {canCreateTeams ? 'Create your first team to get started' : 'No teams available'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Team</th>
                      <th>Department</th>
                      <th>Team Manager</th>
                      <th>Team Leader</th>
                      <th>Members</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team._id}>
                        <td>
                          <div>
                            <div className="fw-semibold">{team.name}</div>
                            <small className="text-muted">
                              <code>{team.code}</code>
                              {team.description && ` • ${team.description}`}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {team.department?.name || 'Not assigned'}
                          </span>
                        </td>
                        <td>
                          {team.teamManager ? (
                            <div>
                              <div className="fw-semibold">
                                {team.teamManager.firstName} {team.teamManager.lastName}
                              </div>
                              <small className="text-muted">{team.teamManager.email}</small>
                            </div>
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                        <td>
                          {team.teamLeader ? (
                            <div>
                              <div className="fw-semibold">
                                {team.teamLeader.firstName} {team.teamLeader.lastName}
                              </div>
                              <small className="text-muted">{team.teamLeader.email}</small>
                            </div>
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {team.currentSize || 0} / {team.maxSize}
                          </span>
                        </td>
                        <td>
                          {getStatusBadge(team.isActive)}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            {canManageTeamMembers(team) && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="Manage Members"
                                onClick={() => handleManageMembers(team)}
                              >
                                <i className="bi bi-people"></i>
                              </button>
                            )}
                            {canEditTeam(team) && (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                title="Edit Team"
                                onClick={() => handleEditTeam(team)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            )}
                            {canCreateTeams && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete Team"
                                onClick={() => handleDeleteTeam(team)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Team Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleAddTeam} noValidate>
                <div className="modal-header">
                  <h5 className="modal-title">Add New Team</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => {
                      setShowAddModal(false);
                      setValidationErrors({});
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Team Name *</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={addFormData.name}
                        onChange={handleAddInputChange}
                        required
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback">
                          {validationErrors.name}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Team Code *</label>
                      <input
                        type="text"
                        className={`form-control ${validationErrors.code ? 'is-invalid' : ''}`}
                        name="code"
                        value={addFormData.code}
                        onChange={handleAddInputChange}
                        placeholder="e.g., DEV, QA, SALES"
                        style={{ textTransform: 'uppercase' }}
                        required
                      />
                      {validationErrors.code && (
                        <div className="invalid-feedback">
                          {validationErrors.code}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={addFormData.description}
                        onChange={handleAddInputChange}
                        rows="3"
                        placeholder="Brief description of the team's purpose and responsibilities"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department *</label>
                      <select
                        className={`form-select ${validationErrors.department ? 'is-invalid' : ''}`}
                        name="department"
                        value={addFormData.department}
                        onChange={handleAddInputChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                      </select>
                      {validationErrors.department && (
                        <div className="invalid-feedback">
                          {validationErrors.department}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Max Team Size</label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.maxSize ? 'is-invalid' : ''}`}
                        name="maxSize"
                        value={addFormData.maxSize}
                        onChange={handleAddInputChange}
                        min="1"
                        max="50"
                      />
                      {validationErrors.maxSize && (
                        <div className="invalid-feedback">
                          {validationErrors.maxSize}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Team Manager</label>
                      <select
                        className="form-select"
                        name="teamManager"
                        value={addFormData.teamManager}
                        onChange={handleAddInputChange}
                      >
                        <option value="">Select Team Manager</option>
                        {teamManagers.map(manager => (
                          <option key={manager._id} value={manager._id}>
                            {manager.firstName} {manager.lastName} ({manager.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Team Leader</label>
                      <select
                        className="form-select"
                        name="teamLeader"
                        value={addFormData.teamLeader}
                        onChange={handleAddInputChange}
                      >
                        <option value="">Select Team Leader</option>
                        {teamLeaders.map(leader => (
                          <option key={leader._id} value={leader._id}>
                            {leader.firstName} {leader.lastName} ({leader.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setValidationErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && editingTeam && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleUpdateTeam} noValidate>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Team</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTeam(null);
                      setValidationErrors({});
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    {canManageAllTeams && (
                      <div className="col-md-6">
                        <label className="form-label">Team Name *</label>
                        <input
                          type="text"
                          className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditInputChange}
                          required
                        />
                        {validationErrors.name && (
                          <div className="invalid-feedback">
                            {validationErrors.name}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={canManageAllTeams ? "col-md-6" : "col-md-12"}>
                      <label className="form-label">Max Team Size</label>
                      <input
                        type="number"
                        className={`form-control ${validationErrors.maxSize ? 'is-invalid' : ''}`}
                        name="maxSize"
                        value={editFormData.maxSize}
                        onChange={handleEditInputChange}
                        min="1"
                        max="50"
                      />
                      {validationErrors.maxSize && (
                        <div className="invalid-feedback">
                          {validationErrors.maxSize}
                        </div>
                      )}
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        rows="3"
                        placeholder="Brief description of the team's purpose and responsibilities"
                      />
                    </div>
                    {canManageAllTeams && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label">Team Manager</label>
                          <select
                            className="form-select"
                            name="teamManager"
                            value={editFormData.teamManager}
                            onChange={handleEditInputChange}
                          >
                            <option value="">Select Team Manager</option>
                            {teamManagers.map(manager => (
                              <option key={manager._id} value={manager._id}>
                                {manager.firstName} {manager.lastName} ({manager.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Team Leader</label>
                          <select
                            className="form-select"
                            name="teamLeader"
                            value={editFormData.teamLeader}
                            onChange={handleEditInputChange}
                          >
                            <option value="">Select Team Leader</option>
                            {teamLeaders.map(leader => (
                              <option key={leader._id} value={leader._id}>
                                {leader.firstName} {leader.lastName} ({leader.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-12">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="isActive"
                              id="editIsActive"
                              checked={editFormData.isActive}
                              onChange={handleEditInputChange}
                            />
                            <label className="form-check-label" htmlFor="editIsActive">
                              Active Team
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTeam(null);
                      setValidationErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && selectedTeam && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Team Members - {selectedTeam.name}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowMembersModal(false);
                    setSelectedTeam(null);
                    setMemberFormData({ userId: '', role: 'Member' });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {/* Add Member Form */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">Add New Member</h6>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddMember}>
                      <div className="row g-3">
                        <div className="col-md-8">
                          <label className="form-label">Select User</label>
                          <select
                            className="form-select"
                            name="userId"
                            value={memberFormData.userId}
                            onChange={handleMemberInputChange}
                            required
                          >
                            <option value="">Choose a user...</option>
                            {users
                              .filter(u => 
                                u.role === 'Employee' && 
                                !selectedTeam.members?.some(m => m.user._id === u._id)
                              )
                              .map(user => (
                                <option key={user._id} value={user._id}>
                                  {user.firstName} {user.lastName} ({user.email}) - {user.role}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Member Role</label>
                          <select
                            className="form-select"
                            name="role"
                            value={memberFormData.role}
                            onChange={handleMemberInputChange}
                          >
                            <option value="Member">Member</option>
                            <option value="Senior Member">Senior Member</option>
                            <option value="Lead">Lead</option>
                          </select>
                        </div>
                        <div className="col-md-12">
                          <button type="submit" className="btn btn-primary">
                            <i className="bi bi-plus-circle me-1"></i>
                            Add Member
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Current Members */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      Current Members ({selectedTeam.currentSize || 0} / {selectedTeam.maxSize})
                    </h6>
                  </div>
                  <div className="card-body">
                    {selectedTeam.members && selectedTeam.members.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Member</th>
                              <th>Role in System</th>
                              <th>Team Role</th>
                              <th>Joined Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTeam.members.map((member) => (
                              <tr key={member.user._id}>
                                <td>
                                  <div>
                                    <div className="fw-semibold">
                                      {member.user.firstName} {member.user.lastName}
                                    </div>
                                    <small className="text-muted">{member.user.email}</small>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">
                                    {member.user.role || 'Employee'}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-info">
                                    {member.role}
                                  </span>
                                </td>
                                <td>
                                  <small>
                                    {new Date(member.joinedDate).toLocaleDateString()}
                                  </small>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    title="Remove Member"
                                    onClick={() => handleRemoveMember(member.user._id)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <i className="bi bi-people text-muted" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted mt-2">No members in this team yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowMembersModal(false);
                    setSelectedTeam(null);
                    setMemberFormData({ userId: '', role: 'Member' });
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
