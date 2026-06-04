'use client'

import { useState } from 'react'

interface DeleteConfirmDialogProps {
  adminName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmDialog({ adminName, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('')

  function handleConfirm() {
    if (confirmText === 'DELETE') {
      onConfirm()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-bold text-red-600 mb-2">⚠️ Delete Admin Account</h3>
          <p className="text-gray-900 font-semibold mb-2">{adminName}</p>
          <p className="text-gray-600 mb-4">
            This will:
            <br />• Delete the admin account
            <br />• Preserve their network (Team Admins, Org Admins)
            <br />• Keep Strategic Partners assigned
            <br /><br />
            <strong className="text-red-600">This action CANNOT be undone!</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
              placeholder="DELETE"
              autoFocus
            />
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== 'DELETE'}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  )
}
