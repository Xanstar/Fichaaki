import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, KeyRound, MapPin, Navigation, QrCode, X } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

type Action = 'entrada' | 'salida'

export interface CheckInPayload {
  observacion?: string
  codigoSucursal?: string
  pin?: string
  useCode: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  action: Action
  loading: boolean
  onConfirm: (payload: CheckInPayload) => void
}

const inputClasses =
  'w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'

const SCANNER_ID = 'fichaqui-qr-scanner'

export function CheckInModal({ open, onClose, action, loading, onConfirm }: Props) {
  const [useCode, setUseCode] = useState(false)
  const [observacion, setObservacion] = useState('')
  const [codigo, setCodigo] = useState('')
  const [pin, setPin] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)

  async function stopScanner() {
    setScanning(false)
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {
        // el scanner ya está detenido
      }
      scannerRef.current = null
    }
  }

  useEffect(() => {
    if (!open) {
      stopScanner()
      setUseCode(false)
      setObservacion('')
      setCodigo('')
      setPin('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startScanner() {
    setScanError('')
    setScanning(true)

    try {
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          const match = decodedText.match(/^FICHAQUI:(\S+)$/i)
          if (!match) {
            setScanError('Ese QR no es un código de Fichaqui.')
            return
          }
          setCodigo(match[1].toUpperCase())
          stopScanner()
        },
        () => {
          // frames sin detección; no hacer nada
        }
      )
    } catch (err) {
      console.error(err)
      setScanning(false)
      setScanError(
        'No se pudo acceder a la cámara. Ingresá el código manualmente o usá GPS.'
      )
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm md:items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl md:max-w-lg md:rounded-3xl"
          >
            <div className="flex items-start justify-between border-b border-border-subtle px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-ink">
                  {action === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Elegí cómo validar tu ubicación y sumá una observación si querés.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-ink-soft transition hover:bg-surface-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Observación (opcional)
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  placeholder="Ej: Llegué antes por reunión"
                  className={`${inputClasses} resize-none`}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-ink">Método de ubicación</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCode(false)
                      setScanning(false)
                    }}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition ${
                      !useCode
                        ? 'border-brand bg-brand-soft'
                        : 'border-border-subtle hover:bg-surface-muted'
                    }`}
                  >
                    <Navigation className={`h-6 w-6 ${!useCode ? 'text-brand' : 'text-ink-soft'}`} />
                    <span className="text-sm font-semibold text-ink">GPS</span>
                    <span className="text-center text-xs text-ink-soft">
                      Usa mi ubicación actual
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUseCode(true)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition ${
                      useCode
                        ? 'border-brand bg-brand-soft'
                        : 'border-border-subtle hover:bg-surface-muted'
                    }`}
                  >
                    <QrCode className={`h-6 w-6 ${useCode ? 'text-brand' : 'text-ink-soft'}`} />
                    <span className="text-sm font-semibold text-ink">Código / QR</span>
                    <span className="text-center text-xs text-ink-soft">
                      Escaneá el QR o usá el código + PIN
                    </span>
                  </button>
                </div>
              </div>

              {useCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  {scanning ? (
                    <div className="rounded-2xl border border-border-subtle bg-surface-muted p-3">
                      <div id={SCANNER_ID} className="mx-auto max-w-[280px] overflow-hidden rounded-xl" />
                      <button
                        type="button"
                        onClick={stopScanner}
                        className="mt-3 w-full rounded-xl bg-surface px-3 py-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                      >
                        Cancelar escaneo
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startScanner}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-soft py-3 font-semibold text-brand transition hover:opacity-90"
                    >
                      <Camera size={18} />
                      Escanear QR con la cámara
                    </button>
                  )}

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
                      <QrCode className="h-4 w-4 text-brand" />
                      Código de sucursal
                    </label>
                    <input
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      placeholder="SUC-01"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
                      <KeyRound className="h-4 w-4 text-brand" />
                      PIN personal
                    </label>
                    <input
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Obligatorio si tu usuario tiene PIN"
                      inputMode="numeric"
                      className={inputClasses}
                    />
                  </div>

                  {scanError && (
                    <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
                      {scanError}
                    </p>
                  )}
                </motion.div>
              )}

              {!useCode && (
                <p className="flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-xs text-ink">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  Con GPS se valida que estés dentro del radio de tu sucursal. Si no estás
                  asignado a ninguna, el fichaje se registra igual.
                </p>
              )}
            </div>

            <div className="border-t border-border-subtle p-6">
              <button
                onClick={() => {
                  if (useCode && !codigo.trim()) return
                  onConfirm({
                    observacion: observacion.trim() || undefined,
                    codigoSucursal: useCode ? codigo.trim().toUpperCase() : undefined,
                    pin: useCode ? pin || undefined : undefined,
                    useCode,
                  })
                }}
                disabled={loading || (useCode && !codigo.trim())}
                className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              >
                {loading
                  ? 'Registrando...'
                  : action === 'entrada'
                    ? 'Registrar entrada'
                    : 'Registrar salida'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
