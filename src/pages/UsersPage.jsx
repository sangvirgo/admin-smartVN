"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import {
  AlertCircle, Loader, Search, Edit2, Phone, ShieldAlert,
  Ban, ShieldCheck, Check // Removed Trash2, MoreVertical, UserCog
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Helper function to get initials for avatar fallback (Giữ nguyên)
const getInitials = (firstName, lastName) => {
  const firstInitial = firstName?.[0]?.toUpperCase() || "";
  const lastInitial = lastName?.[0]?.toUpperCase() || "";
  if (firstInitial && lastInitial) return `${firstInitial}${lastInitial}`;
  if (firstInitial) return firstInitial;
  if (lastInitial) return lastInitial;
  return "?";
};

// Helper function to format date (simplified) (Giữ nguyên)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch (e) { return "Invalid Date"; }
};

// --- Component ---
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Lỗi fetch chung
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [bannedFilter, setBannedFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // State loading cho actions (null | userId)
  const [actionError, setActionError] = useState(null); // State lỗi cho actions
  const [successMessage, setSuccessMessage] = useState(null); // State thông báo thành công

  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();

  // --- Fetch Data ---
  const fetchUsers = async (pageNum = 1) => {
    setActionError(null); // Reset lỗi action khi fetch
    setSuccessMessage(null); // Reset thành công khi fetch
    setLoading(true);
    setError(null);

    let isBannedParam = null;
    if (bannedFilter === "BANNED") isBannedParam = true;
    else if (bannedFilter === "NOT_BANNED") isBannedParam = false;

    try {
      const response = await userService.getUsers(
        pageNum - 1, 10, searchTerm,
        roleFilter !== "ALL" ? roleFilter : "",
        isBannedParam
      );
      const fetchedUsers = response.data.content || response.data.data || [];
      setUsers(fetchedUsers);
      setTotalPages(response.data.totalPages || response.data.pagination?.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load users";
      setError(errorMessage);
      console.error("Users error:", err.response || err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, bannedFilter]);

  // --- Action Handlers ---
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleBan = async (userId, userName) => { // Thêm userName để hiển thị confirm
    if (userId === currentUser?.id) {
        setActionError("You cannot ban yourself."); return;
    }
    // Sửa lại confirm message
    if (!window.confirm(`Are you sure you want to BAN user "${userName}" (ID: ${userId})?`)) return;

    setActionLoading(userId); setActionError(null);
    try {
        await userService.banUser(userId);
        showSuccess(`User "${userName}" banned successfully.`);
        setUsers(users.map(u => u.id === userId ? { ...u, banned: true, active: false } : u)); // Cập nhật cả active
    } catch (err) {
        setActionError(err.response?.data?.message || err.message || "Failed to ban user");
    } finally { setActionLoading(null); }
  };

  const handleUnban = async (userId, userName) => { // Thêm userName
     // Sửa lại confirm message
     if (!window.confirm(`Are you sure you want to UNBAN user "${userName}" (ID: ${userId})?`)) return;

     setActionLoading(userId); setActionError(null);
     try {
         await userService.unbanUser(userId);
         showSuccess(`User "${userName}" unbanned successfully.`);
         setUsers(users.map(u => u.id === userId ? { ...u, banned: false, active: true } : u)); // Cập nhật cả active
     } catch (err) {
         setActionError(err.response?.data?.message || err.message || "Failed to unban user");
     } finally { setActionLoading(null); }
  };

   const handleChangeRole = async (userId, userName, newRole) => { // Thêm userName
    if (userId === currentUser?.id) {
        setActionError("You cannot change your own role."); return;
    }
     // Sửa lại confirm message
     if (!window.confirm(`Change user "${userName}" (ID: ${userId}) role to ${newRole}?`)) return;

     setActionLoading(userId); setActionError(null);
     try {
         await userService.changeRole(userId, newRole);
         showSuccess(`User "${userName}" role changed to ${newRole}.`);
         setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
     } catch (err) {
         setActionError(err.response?.data?.message || err.message || "Failed to change role");
     } finally { setActionLoading(null); }
  };

  // LOẠI BỎ: Hàm handleDelete

  const handleEdit = (id) => { navigate(`/users/${id}`); };

  // --- Render Functions (Giữ nguyên) ---
  const renderRoleBadge = (role) => { /* ... giữ nguyên ... */
    let bgColor = "bg-gray-100"; let textColor = "text-gray-800";
    if (role === "ADMIN") { bgColor = "bg-purple-100"; textColor = "text-purple-800"; }
    else if (role === "STAFF") { bgColor = "bg-blue-100"; textColor = "text-blue-800"; }
    else if (role === "CUSTOMER") { bgColor = "bg-green-100"; textColor = "text-green-800"; }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>{role || 'N/A'}</span>;
   };
  const renderStatusBadge = (isActive) => { /* ... giữ nguyên ... */
    const bgColor = isActive ? "bg-green-100" : "bg-red-100";
    const textColor = isActive ? "text-green-800" : "text-red-800";
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>{isActive ? "Active" : "Inactive"}</span>;
   };
   const renderBannedStatus = (isBanned) => { /* ... giữ nguyên ... */
    return isBanned ? <span className="flex items-center text-red-600 text-xs font-medium mt-1"><Ban size={14} className="mr-1"/> Banned</span> : null;
   };

  // --- Render Error/Loading/No Data (Giữ nguyên) ---
   if (error && !loading && users.length === 0) { return ( /* ... giữ nguyên ... */
    <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Users</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button onClick={() => fetchUsers(1)} className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Try Again</button>
          </div>
        </div>
      </div>
   ); }

  // --- Main Return ---
  return (
    <div className="space-y-6">
      {/* Page Header (Giữ nguyên) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
      </div>

       {/* Action Error/Success Messages (Giữ nguyên) */}
       {actionError && ( <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm items-center"><AlertCircle size={18} className="text-red-600 flex-shrink-0" /><p className="text-red-700">{actionError}</p></div> )}
       {successMessage && ( <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 text-sm items-center"><Check size={18} className="text-green-600 flex-shrink-0" /><p className="text-green-700">{successMessage}</p></div> )}
       {/* General Fetch Error (Giữ nguyên) */}
       {error && !actionError && ( <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm items-center"><AlertCircle size={18} className="text-red-600 flex-shrink-0" /><p className="text-red-700">Could not load users: {error}</p></div> )}

      {/* Filters (Giữ nguyên) */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white">
            <option value="ALL">All Roles</option> <option value="ADMIN">Admin</option> <option value="STAFF">Staff</option> <option value="CUSTOMER">Customer</option>
          </select>
          <select value={bannedFilter} onChange={(e) => setBannedFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white">
            <option value="ALL">All Ban Status</option> <option value="BANNED">Banned</option> <option value="NOT_BANNED">Not Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table (CẬP NHẬT: Loại bỏ nút Delete) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? ( <div className="flex items-center justify-center h-64"><Loader size={32} className="animate-spin text-blue-600" /><p className="ml-3 text-gray-600">Loading users...</p></div>
        ) : users.length === 0 ? ( <div className="p-8 text-center"><p className="text-gray-500">No users found matching your criteria.</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Warnings</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'N/A'; // Lấy tên hoặc email để hiển thị confirm
                    return (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${actionLoading === user.id ? 'opacity-50 pointer-events-none' : ''}`}> {/* Thêm pointer-events-none */}
                      {/* User Column (Giữ nguyên) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium overflow-hidden">
                            {user.imageUrl ? <img className="h-full w-full object-cover" src={user.imageUrl} alt={userName} onError={(e) => { e.target.style.display='none'; e.target.parentElement.querySelector('span').style.display='flex'; }} /> : null }
                            <span style={{ display: user.imageUrl ? 'none' : 'flex' }} className="items-center justify-center w-full h-full">{getInitials(user.firstName, user.lastName)}</span>
                          </div>
                          <div className="text-sm"><p className="font-medium text-gray-900">{userName}</p><p className="text-gray-500 truncate max-w-[150px]">{user.email || 'N/A'}</p></div>
                        </div>
                      </td>
                      {/* Contact Column (Giữ nguyên) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.mobile ? <div className="flex items-center gap-1"><Phone size={14} /><span>{user.mobile}</span></div> : <span className="italic text-gray-400">No mobile</span>}
                      </td>
                      {/* Role Column (Giữ nguyên) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{renderRoleBadge(user.role)}</td>
                      {/* Status Column (Giữ nguyên) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm"><div>{renderStatusBadge(user.active)}</div><div>{renderBannedStatus(user.banned)}</div></td>
                       {/* Warnings Column (Giữ nguyên) */}
                       <td className="px-6 py-4 whitespace-nowrap text-sm"><div className="flex items-center gap-1 text-gray-700"><ShieldAlert size={16} className={user.warningCount > 0 ? 'text-orange-500' : 'text-gray-400'}/><span>{user.warningCount ?? 0}</span></div></td>
                      {/* Joined Column (Giữ nguyên) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                      {/* Actions Column (LOẠI BỎ Delete) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          {isAdmin && user.id !== currentUser?.id ? (
                            <>
                              <button onClick={() => handleEdit(user.id)} disabled={actionLoading !== null} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" title="Edit user"><Edit2 size={16} /></button>
                              {user.banned ? (
                                <button onClick={() => handleUnban(user.id, userName)} disabled={actionLoading !== null} className="p-1.5 hover:bg-green-100 rounded-md transition-colors text-green-600 disabled:opacity-50 disabled:cursor-not-allowed" title="Unban user">{actionLoading === user.id ? <Loader size={16} className="animate-spin"/> : <ShieldCheck size={16} />}</button>
                              ) : (
                                <button onClick={() => handleBan(user.id, userName)} disabled={actionLoading !== null} className="p-1.5 hover:bg-yellow-100 rounded-md transition-colors text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed" title="Ban user">{actionLoading === user.id ? <Loader size={16} className="animate-spin"/> : <Ban size={16} />}</button>
                              )}
                              <select value={user.role} onChange={(e) => handleChangeRole(user.id, userName, e.target.value)} disabled={actionLoading !== null} className="p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed" title="Change role">
                                <option value="CUSTOMER">Customer</option><option value="STAFF">Staff</option><option value="ADMIN">Admin</option>
                              </select>
                              {/* Nút Delete đã bị loại bỏ */}
                            </>
                          ) : ( isAdmin && user.id === currentUser?.id ? ( <button onClick={() => handleEdit(user.id)} className="p-1.5 hover:bg-blue-100 rounded-md transition-colors text-blue-600" title="Edit user profile"><Edit2 size={16} /></button> ) : ( <span className="text-xs text-gray-400 italic">No actions</span> ))}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination (Giữ nguyên logic disable) */}
            {totalPages > 1 && ( <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2"><p className="text-sm text-gray-600">Page {page} of {totalPages}</p><div className="flex gap-2"><button onClick={() => fetchUsers(page - 1)} disabled={page === 1 || loading || actionLoading} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button><button onClick={() => fetchUsers(page + 1)} disabled={page === totalPages || loading || actionLoading} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button></div></div> )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;