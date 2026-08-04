import { motion } from "framer-motion";

import reloj from "../../assets/logo1.png";
import texto from "../../assets/logo2.png";

export function AnimatedLogo() {
  return (
    <div className="flex flex-col items-center gap-6">

      {/* RELOJ */}

 <motion.img
  src={reloj}
  alt="Logo"
  className="w-36"
  initial={{
    opacity: 0,
    scale: 0.7,
    rotateY: -200,
  }}
  animate={{
    opacity: 1,
    scale: 1,
     rotateY: [0, 90, 180, 270, 360],
  }}
  transition={{
    duration: 0.8,
    ease: "easeOut",
  }}
  style={{
    transformStyle: "preserve-3d",
  }}
/>

      {/* TEXTO */}

     <motion.img
  src={texto}
  alt="FichAKI"
  className="w-72"
  initial={{
    opacity: 0,
    y: 50,
  }}
  animate={{
    opacity: 1,
    y: 0,
  }}
  transition={{
    delay: 0.3,
    duration: 0.5,
    ease: "easeOut",
  }}
/>

    </div>
  );
}