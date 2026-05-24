import { useEffect, useRef } from 'react'
import SignaturePadLib from 'signature_pad'
import { Pen, RotateCcw, Check } from 'lucide-react'
import { formatDateTime } from '../utils/formatters'

export default function SignaturePad({ id, label, value, onChange }) {
  const canvasRef  = useRef(null)
  const padRef     = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const pad = new SignaturePadLib(canvas, {
      penColor: '#1e3a8a',
      backgroundColor: 'rgba(0,0,0,0)',
      minWidth: 1,
      maxWidth: 3,
    })
    padRef.current = pad

    // Restore existing signature
    if (value) {
      pad.fromDataURL(value)
    }

    // Resize handler
    function resize() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const rect  = canvas.getBoundingClientRect()
      canvas.width  = rect.width * ratio
      canvas.height = rect.height * ratio
      canvas.getContext('2d').scale(ratio, ratio)
      pad.clear()
      if (value) pad.fromDataURL(value)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      pad.off()
    }
  }, []) // eslint-disable-line

  function clear() {
    padRef.current?.clear()
    onChange(null)
  }

  function save() {
    const pad = padRef.current
    if (!pad || pad.isEmpty()) return
    const dataURL = pad.toDataURL('image/png')
    onChange(dataURL)
  }

  return (
    <div className="space-y-2" id={id}>
      <div className="flex items-center justify-between">
        <label className="form-label flex items-center gap-1.5 mb-0">
          <Pen size={14} className="text-gray-500" />
          {label}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="btn-secondary btn-sm flex items-center gap-1"
          >
            <RotateCcw size={13} /> Clear
          </button>
          <button
            type="button"
            onClick={save}
            className="btn-primary btn-sm flex items-center gap-1"
          >
            <Check size={13} /> Save
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          style={{ height: 160, display: 'block', width: '100%' }}
        />
        {!value && (
          <p className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm pointer-events-none select-none">
            Sign here using mouse or finger
          </p>
        )}
      </div>

      {value && (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <Check size={14} className="text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700">
            Signature captured · {formatDateTime(new Date().toISOString())}
          </p>
        </div>
      )}
    </div>
  )
}
