import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image } from 'lucide-react'
import { formatFileSize } from '../utils/formatters'

function FileIcon({ type }) {
  if (type?.startsWith('image/')) return <Image size={16} className="text-blue-500" />
  return <FileText size={16} className="text-red-500" />
}

export default function FileUpload({ id, files = [], onChange, accept, label, multiple = false }) {
  const onDrop = useCallback(accepted => {
    const next = multiple ? [...files, ...accepted] : accepted.slice(0, 1)
    onChange(next)
  }, [files, multiple, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept, multiple,
  })

  function remove(index) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <div
        id={id}
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
      >
        <input {...getInputProps()} capture={accept?.['image/*'] ? 'environment' : undefined} />
        <Upload size={24} className={`mx-auto mb-2 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
        <p className="text-sm text-gray-500">{label || 'Drop files here or click to browse'}</p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG supported · Max 10MB each</p>
        <p className="text-xs text-primary-500 mt-1 font-medium">📷 Mobile users can use camera</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
            >
              <FileIcon type={file.type} />
              <span className="flex-1 text-sm text-gray-700 truncate">{file.name}</span>
              <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
              {/* Image preview thumbnail */}
              {file.type?.startsWith('image/') && (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-8 h-8 rounded object-cover border"
                />
              )}
              <button
                onClick={() => remove(i)}
                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
