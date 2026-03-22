import { motion } from "framer-motion"

export const pageTransition = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
  transition: { duration: 0 }
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0 }
  }
}

export const revealUp = {
  initial: { opacity: 1, y: 0 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0 }
}

export default function MotionPage({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
