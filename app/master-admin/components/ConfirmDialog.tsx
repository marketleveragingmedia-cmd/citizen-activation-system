'use client'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ 
  title, 
  message, 
  confirmText = 'Confirm',
  confirmColor = 'blue',
  onConfirm, 
  onCancel 
}: ConfirmDialogProps) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 whitespace-pre-line">{message}</p>
        </div>
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${colorClasses[confirmColor as keyof typeof colorClasses] || colorClasses.blue} text-white font-medium py-2 px-4 rounded-lg text-sm`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
