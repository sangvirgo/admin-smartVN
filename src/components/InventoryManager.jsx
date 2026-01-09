// Component modal để quản lý inventory
// Features:
// - Hiển thị danh sách inventory hiện tại
// - Form thêm inventory mới
// - Form sửa inventory (inline hoặc modal con)
// - Validation
// - Loading states
// - Error handling

import { useState, useEffect } from "react"
import { productService } from "../services/api"
import { X, Plus, Edit2, Save, Loader, AlertCircle } from "lucide-react"

const InventoryManager = ({ productId, productTitle, onClose, onSuccess }) => {
  const [inventories, setInventories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  
  // State cho form thêm mới
  const [newInventory, setNewInventory] = useState({
    size: "", quantity: 0, price: 0, discountPercent: 0
  })
  
  // State cho chế độ edit (inventoryId đang edit)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})

  // Load inventories khi mount
  useEffect(() => {
    fetchInventories()
  }, [productId])

  const fetchInventories = async () => {
    try {
      setLoading(true)
      const res = await productService.getProductById(productId)
      setInventories(res.data.data.inventories || [])
    } catch (err) {
      setError("Không thể tải dữ liệu kho")
    } finally {
      setLoading(false)
    }
  }

  const handleAddInventory = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await productService.addInventory(productId, newInventory)
      setNewInventory({ size: "", quantity: 0, price: 0, discountPercent: 0 })
      await fetchInventories()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || "Thêm kho thất bại")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateInventory = async (invId) => {
    setSaving(true)
    setError(null)
    try {
      await productService.updateInventory(productId, invId, editData)
      setEditingId(null)
      setEditData({})
      await fetchInventories()
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật kho thất bại")
    } finally {
      setSaving(false)
    }
  }

  // UI: Modal overlay + content
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quản lý Kho hàng</h2>
            <p className="text-sm text-gray-600 mt-1">{productTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form thêm mới */}
          <form onSubmit={handleAddInventory} className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Thêm biến thể mới</h3>
            <div className="grid grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Kích cỡ *"
                value={newInventory.size}
                onChange={(e) => setNewInventory({...newInventory, size: e.target.value})}
                required
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Số lượng *"
                value={newInventory.quantity}
                onChange={(e) => setNewInventory({...newInventory, quantity: e.target.value})}
                required
                min="0"
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Giá *"
                value={newInventory.price}
                onChange={(e) => setNewInventory({...newInventory, price: e.target.value})}
                required
                min="0"
                step="1000"
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Giảm giá %"
                value={newInventory.discountPercent}
                onChange={(e) => setNewInventory({...newInventory, discountPercent: e.target.value})}
                min="0"
                max="100"
                className="px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {saving ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
              Thêm biến thể
            </button>
          </form>

          {/* Danh sách inventory */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Biến thể hiện có</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader size={24} className="animate-spin text-blue-600" />
              </div>
            ) : inventories.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-4">Chưa có biến thể nào</p>
            ) : (
              <div className="space-y-2">
                {inventories.map((inv) => {
                  const isEditing = editingId === inv.id
                  return (
                    <div key={inv.id} className="border rounded-lg p-3">
                      {isEditing ? (
                        // Edit mode
                        <div className="grid grid-cols-5 gap-2">
                          <input
                            type="text"
                            value={editData.size}
                            onChange={(e) => setEditData({...editData, size: e.target.value})}
                            className="px-2 py-1 border rounded text-sm"
                          />
                          <input
                            type="number"
                            value={editData.quantity}
                            onChange={(e) => setEditData({...editData, quantity: e.target.value})}
                            className="px-2 py-1 border rounded text-sm"
                          />
                          <input
                            type="number"
                            value={editData.price}
                            onChange={(e) => setEditData({...editData, price: e.target.value})}
                            className="px-2 py-1 border rounded text-sm"
                          />
                          <input
                            type="number"
                            value={editData.discountPercent}
                            onChange={(e) => setEditData({...editData, discountPercent: e.target.value})}
                            className="px-2 py-1 border rounded text-sm"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUpdateInventory(inv.id)}
                              className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                            >
                              <Save size={14} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => {setEditingId(null); setEditData({})}}
                              className="flex-1 bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-400"
                            >
                              <X size={14} className="mx-auto" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-4 gap-4 flex-1 text-sm">
                            <div><span className="text-gray-500">Kích cỡ:</span> <span className="font-medium">{inv.size}</span></div>
                            <div><span className="text-gray-500">SL:</span> <span className="font-medium">{inv.quantity}</span></div>
                            <div><span className="text-gray-500">Giá:</span> <span className="font-medium">{inv.price.toLocaleString('vi-VN')}₫</span></div>
                            <div><span className="text-gray-500">Giảm:</span> <span className="font-medium">{inv.discountPercent}%</span></div>
                          </div>
                          <button
                            onClick={() => {
                              setEditingId(inv.id)
                              setEditData({
                                size: inv.size,
                                quantity: inv.quantity,
                                price: inv.price,
                                discountPercent: inv.discountPercent
                              })
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default InventoryManager