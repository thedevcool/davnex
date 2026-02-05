"use client";

import { useState, useEffect } from "react";
import { getCountdown } from "@/lib/productUtils";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  availableDate: Date;
  onCountdownComplete?: () => void;
}

export default function CountdownTimer({
  availableDate,
  onCountdownComplete,
}: CountdownTimerProps) {
  const [countdown, setCountdown] = useState(getCountdown(availableDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdown = getCountdown(availableDate);
      setCountdown(newCountdown);

      if (newCountdown.isAvailable && onCountdownComplete) {
        onCountdownComplete();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [availableDate, onCountdownComplete]);

  if (countdown.isAvailable) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <Clock className="w-5 h-5 text-purple-600" />
      <div className="flex gap-3 text-center">
        {countdown.days > 0 && (
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {countdown.days}
            </div>
            <div className="text-xs text-purple-600">
              {countdown.days === 1 ? "Day" : "Days"}
            </div>
          </div>
        )}
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {String(countdown.hours).padStart(2, "0")}
          </div>
          <div className="text-xs text-purple-600">Hours</div>
        </div>
        <div className="text-2xl font-bold text-purple-600">:</div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {String(countdown.minutes).padStart(2, "0")}
          </div>
          <div className="text-xs text-purple-600">Min</div>
        </div>
        <div className="text-2xl font-bold text-purple-600">:</div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {String(countdown.seconds).padStart(2, "0")}
          </div>
          <div className="text-xs text-purple-600">Sec</div>
        </div>
      </div>
    </div>
  );
}
