import { motion } from 'framer-motion'
import { LogoMark } from '../Logo'

export function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <LogoMark size={72} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45, ease: 'easeOut' }}
          className="mt-5 font-display text-xl font-extrabold tracking-tight text-ink"
        >
          Fichaqui
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="mt-1 text-sm text-ink-soft"
        >
          Control de asistencia
        </motion.p>
      </div>
    </motion.div>
  )
}
