"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  AlertCircle, Loader, ArrowLeft, Mail, Phone, CalendarDays, KeyRound,
  ShieldAlert, Ban, ShieldCheck, UserCog, Check, CircleUserRound
} from "lucide-react";

// --- Helper Functions (Giữ nguyên) ---
const getInitials = (firstName, lastName) => {
  const firstInitial = firstName?.[0]?.toUpperCase() || "";
  const lastInitial = lastName?.[0]?.toUpperCase() || "";
  if (firstInitial && lastInitial) return `${firstInitial}${lastInitial}`;
  if (firstInitial) return firstInitial;
  if (lastInitial) return lastInitial;
  return "?";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch (e) { return "Invalid Date"; }
};

const renderRoleBadge = (role) => {
    let bgColor = "bg-gray-100"; let textColor = "text-gray-800";
    if (role === "ADMIN") { bgColor = "bg-purple-100"; textColor = "text-purple-800"; }
    else if (role === "STAFF") { bgColor = "bg-blue-100"; textColor = "text-blue-800"; }
    else if (role === "CUSTOMER") { bgColor = "bg-green-100"; textColor = "text-green-800"; }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>{role || 'N/A'}</span>;
};

const renderStatusBadge = (isActive) => {
    const bgColor = isActive ? "bg-green-100" : "bg-red-100";
    const textColor = isActive ? "text-green-800" : "text-red-800";
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>{isActive ? "Active" : "Inactive"}</span>;
};

const renderBannedStatus = (isBanned) => {
    return isBanned ? <span className="inline-flex items-center ml-2 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><Ban size={14} className="mr-1"/> Banned</span> : null;
};


// --- Helper Components (ĐỊNH NGHĨA BÊN NGOÀI) ---
const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-2"> {/* Thêm padding y */}
        {Icon && <Icon size={18} className="text-gray-500 mt-0.5 mr-3 flex-shrink-0" />} {/* Kiểm tra Icon tồn tại */}
        <div className={!Icon ? 'ml-[calc(18px+0.75rem)]' : ''}> {/* Thêm margin nếu không có icon */}
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            <div className="text-sm text-gray-800 mt-1">{value}</div>
        </div>
    </div>
);

const ActionButton = ({ onClick, icon: Icon, label, color, loading, disabled = false, title = "" }) => {
    const colors = {
        red: "bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white",
        green: "bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white",
        yellow: "bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white",
        blue: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white",
    };
    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            title={title || label}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${colors[color] || colors.blue} disabled:cursor-not-allowed`}
        >
            {loading ? <Loader size={16} className="animate-spin" /> : (Icon && <Icon size={16} />)} {/* Kiểm tra Icon tồn tại */}
            {label}
        </button>
    );
};


// --- Main Component ---
const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- Fetch User Data (Giữ nguyên) ---
  const fetchUser = async () => {
    setLoading(true); setError(null); setActionError(null); setSuccessMessage(null);
    try {
      const response = await userService.getUserById(id);
      if (response.data && response.data.data) {
        setUser(response.data.data);
      } else {
        throw new Error("Invalid user data structure received.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load user";
      setError(errorMessage);
      console.error("User detail error:", err.response || err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- Action Handlers (Giữ nguyên) ---
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleAction = async (actionType, payload = null) => {
     if (user?.id === currentUser?.id && actionType !== 'warn') {
         setActionError(`You cannot ${actionType} yourself.`); return;
     }

    let confirmMessage = ""; let apiCall; let successMsg = "";
    const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || `User ID ${id}`;

    switch (actionType) {
      case 'ban':
        confirmMessage = `Are you sure you want to BAN user "${userName}"?`;
        apiCall = () => userService.banUser(id);
        successMsg = `User "${userName}" banned successfully.`;
        break;
      case 'unban':
        confirmMessage = `Are you sure you want to UNBAN user "${userName}"?`;
        apiCall = () => userService.unbanUser(id);
        successMsg = `User "${userName}" unbanned successfully.`;
        break;
      case 'changeRole':
        if (!payload) return;
        confirmMessage = `Change user "${userName}" role to ${payload}?`;
        apiCall = () => userService.changeRole(id, payload);
        successMsg = `User "${userName}" role changed to ${payload}.`;
        break;
      case 'warn':
        apiCall = () => userService.warnUser(id);
        successMsg = `Warning count for user "${userName}" increased.`;
        break;
      default: return;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setActionLoading(true); setActionError(null); setSuccessMessage(null);
    try {
      await apiCall();
      showSuccess(successMsg);
      fetchUser(); // Fetch lại
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || `Failed to ${actionType} user`;
      setActionError(errorMsg);
      console.error(`${actionType} error:`, err.response || err);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Render Loading/Error/Not Found (Giữ nguyên) ---
  if (loading) { return ( <div className="flex items-center justify-center min-h-[calc(100vh-150px)]"><Loader size={32} className="animate-spin text-blue-600" /><p className="ml-3 text-gray-600">Loading user details...</p></div> ); }
  if (error && !user) { return ( <div className="p-6 space-y-4"><button onClick={() => navigate("/users")} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"><ArrowLeft size={20} /> Back to Users</button><div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start"><AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" /><div><h3 className="text-lg font-semibold text-red-900">Error Loading User</h3><p className="text-red-700 text-sm mt-1">{error}</p><button onClick={() => fetchUser()} className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Retry</button></div></div></div> ); }
  if (!user && !loading && !error) { return ( <div className="p-6 text-center text-gray-500">User not found.<button onClick={() => navigate("/users")} className="mt-4 text-blue-600 hover:underline">Back to Users List</button></div> ); }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';

  // --- Render User Details ---
  return (
    <div className="space-y-6">
      {/* Page Header (Giữ nguyên) */}
       <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate("/users")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-16 w-16 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 text-xl font-medium overflow-hidden border-2 border-white shadow">
                    {user.imageUrl ? ( <img className="h-full w-full object-cover" src={user.imageUrl} alt={fullName} onError={(e) => { e.target.style.display='none'; e.target.parentElement.querySelector('span').style.display='flex'; }} /> ) : null }
                    <span style={{ display: user.imageUrl ? 'none' : 'flex' }} className="items-center justify-center w-full h-full">{getInitials(user.firstName, user.lastName)}</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                    <p className="text-sm text-gray-500 mt-1">User ID: {user.id}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Action Messages (Giữ nguyên) */}
      {actionError && ( <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm items-center"><AlertCircle size={18} className="text-red-600 flex-shrink-0" /><p className="text-red-700">{actionError}</p></div> )}
      {successMessage && ( <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 text-sm items-center"><Check size={18} className="text-green-600 flex-shrink-0" /><p className="text-green-700">{successMessage}</p></div> )}

      {/* User Info Grid (Sử dụng InfoItem và ActionButton đã định nghĩa bên ngoài) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Main Info */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6 divide-y divide-gray-100"> {/* Thêm divide */}
            <h2 className="text-lg font-semibold text-gray-800 pb-3 mb-1">User Information</h2> {/* Bỏ border, dùng divide */}
            <InfoItem icon={Mail} label="Email" value={user.email || 'N/A'} />
            <InfoItem icon={Phone} label="Mobile" value={user.mobile || <span className="italic text-gray-500">Not provided</span>} />
            <InfoItem icon={KeyRound} label="Role" value={renderRoleBadge(user.role)} />
            <InfoItem icon={CircleUserRound} label="Status" value={<>{renderStatusBadge(user.active)} {renderBannedStatus(user.banned)}</>} />
            <InfoItem icon={ShieldAlert} label="Warnings" value={user.warningCount ?? 0} />
            <InfoItem icon={CalendarDays} label="Joined Date" value={formatDate(user.createdAt)} />
            <InfoItem icon={CalendarDays} label="Last Updated" value={formatDate(user.updatedAt)} />
            <InfoItem label="OAuth Provider" value={user.oauthProvider || <span className="italic text-gray-500">None (Password)</span>} />
        </div>

        {/* Right Column: Admin Actions (Giữ nguyên logic) */}
        {isAdmin && user.id !== currentUser?.id && (
            <div className="md:col-span-1 bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Admin Actions</h2>
                {user.banned ? ( <ActionButton onClick={() => handleAction('unban')} icon={ShieldCheck} label="Unban User" color="green" loading={actionLoading} />
                ) : ( <ActionButton onClick={() => handleAction('ban')} icon={Ban} label="Ban User" color="red" loading={actionLoading} /> )}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Change Role</label>
                    <select value={user.role} onChange={(e) => handleAction('changeRole', e.target.value)} disabled={actionLoading} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                        <option value="CUSTOMER">Customer</option><option value="STAFF">Staff</option><option value="ADMIN">Admin</option>
                    </select>
                 </div>
                 <ActionButton onClick={() => handleAction('warn')} icon={ShieldAlert} label="Increase Warning" color="yellow" loading={actionLoading} disabled={user.banned} title={user.banned ? "Cannot warn a banned user" : "Increase warning count by 1"} />
                 {actionLoading && <div className="text-center pt-2"><Loader size={20} className="animate-spin text-gray-500 inline-block"/></div>}
            </div>
        )}
        {isAdmin && user.id === currentUser?.id && (
             <div className="md:col-span-1 bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6 text-center"><ShieldAlert size={24} className="mx-auto text-yellow-600 mb-2"/><p className="text-sm text-yellow-800">Admin actions are disabled for your own account.</p></div>
        )}
      </div>
    </div>
  );
};

export default UserDetailPage;