// src/hooks/usePermissions.js
import { useAuth } from "../context/AuthContext"

export const usePermissions = () => {
  const { isAdmin, isStaff } = useAuth()

  const permissions = {
    // Users - CHỈ ADMIN
    canViewUsers: isAdmin || isStaff, // STAFF có thể xem danh sách
    canBanUsers: isAdmin, // CHỈ ADMIN
    canWarnUsers: isAdmin, // CHỈ ADMIN
    canUnbanUsers: isAdmin, // CHỈ ADMIN
    canChangeUserRole: isAdmin, // CHỈ ADMIN - THÊM MỚI
    
    // Products
    canCreateProduct: isAdmin,
    canEditProduct: isAdmin,
    canDeleteProduct: isAdmin,
    canToggleProductActive: isAdmin, // THÊM MỚI - riêng cho toggle active
    canUploadProductImages: isAdmin,
    canDeleteProductImages: isAdmin,
    canViewProducts: isAdmin || isStaff,
    
    // Inventory - CẢ ADMIN VÀ STAFF
    canManageInventory: isAdmin || isStaff, // THÊM MỚI - quyền chung
    canAddInventory: isAdmin || isStaff, // THÊM MỚI
    canUpdateInventory: isAdmin || isStaff, // THÊM MỚI
    
    // Orders
    canViewOrders: isAdmin || isStaff,
    canUpdateOrders: isAdmin || isStaff,
    canViewOrderStats: isAdmin,
    
    // Reviews
    canDeleteReviews: isAdmin,
    canViewReviews: isAdmin || isStaff,
    
    // Dashboard
    canViewDashboard: isAdmin,
  }

  return permissions
}