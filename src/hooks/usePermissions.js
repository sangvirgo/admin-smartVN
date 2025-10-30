// src/hooks/usePermissions.js
import { useAuth } from "../context/AuthContext"

export const usePermissions = () => {
  const { isAdmin, isStaff } = useAuth()

  // Ánh xạ quyền dựa trên SecurityConfig và logic nghiệp vụ
  const permissions = {
    // Users (Chỉ Admin)
    canViewUsers: isAdmin,
    canBanUsers: isAdmin,
    canWarnUsers: isAdmin,
    canUnbanUsers: isAdmin,
    
    // Products
    canCreateProduct: isAdmin,
    canEditProduct: isAdmin, // Quyền chung để sửa (gồm cả toggle active)
    canDeleteProduct: isAdmin, // Giả định chỉ Admin được xóa (theo logic frontend cũ)
    canUploadProductImages: isAdmin,
    canDeleteProductImages: isAdmin,
    canViewProducts: isAdmin || isStaff,
    canManageInventory: isAdmin || isStaff,
    
    // Orders
    canViewOrders: isAdmin || isStaff,
    canUpdateOrders: isAdmin || isStaff, // Cả 2 đều được cập nhật trạng thái
    canViewOrderStats: isAdmin, // Chỉ Admin xem thống kê
    
    // Reviews
    canDeleteReviews: isAdmin,
    canViewReviews: isAdmin || isStaff,
    
    // Dashboard
    canViewDashboard: isAdmin, // Chỉ Admin xem dashboard
  }

  return permissions
}