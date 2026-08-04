import { motion } from "framer-motion";

import { AnimatedLogo } from "./AnimatedLogo";
export function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center">

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
          }}
        >
      <AnimatedLogo />
        </motion.div>

        <motion.p
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
            duration: 0.5,
          }}
          className="mt-5 text-sm text-gray-500"
        >
          Control inteligente de asistencia
        </motion.p>

      </div>
    </motion.div>
  );
}