// src/components/PermissionWrapper.jsx
import { usePermissions } from "../hooks/usePermissions"

const PermissionWrapper = ({ permission, fallback = null, children }) => {
  const permissions = usePermissions()
  
  if (!permissions[permission]) {
    return fallback
  }
  
  return <>{children}</>
}

export default PermissionWrapper