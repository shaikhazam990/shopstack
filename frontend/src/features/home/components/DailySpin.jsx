import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DailySpin.module.css";

const DailySpin = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSpin = () => {
    if (spinning || result) return;
    setSpinning(true);
    
    // Simulate spin duration
    setTimeout(() => {
      setSpinning(false);
      setResult("10% OFF");
      setShowModal(true);
      
      // Store that user has spun today
      localStorage.setItem("hasSpunToday", new Date().toDateString());
    }, 3000);
  };

  const hasSpun = localStorage.getItem("hasSpunToday") === new Date().toDateString();

  if (hasSpun && !showModal) return null;

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {showModal ? (
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className={styles.modalContent}>
              <h3>🎉 You Won!</h3>
              <div className={styles.prizeCode}>
                <strong>SAVE10</strong>
                <p>Use code at checkout for 10% off your entire order.</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                Awesome, thanks!
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className={styles.spinContainer}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className={styles.header}>
              <span className={styles.badge}>Daily Reward</span>
              <h4>Spin to Win!</h4>
              <p>Win exclusive discounts for today's drop.</p>
            </div>
            
            <button 
              className={`${styles.spinBtn} ${spinning ? styles.spinning : ''}`}
              onClick={handleSpin}
              disabled={spinning}
            >
              {spinning ? (
                <motion.div 
                  className={styles.spinner}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                >
                  🌀
                </motion.div>
              ) : "Spin Now"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailySpin;
