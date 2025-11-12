'use client';;
import * as React from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

import { useIsInView } from '@/hooks/use-is-in-view';

function CountingNumber({
  ref,
  number = 0, // Valor por defecto
  fromNumber = 0,
  padStart = false,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  decimalSeparator = '.',
  transition = { stiffness: 90, damping: 50 },
  decimalPlaces = 0,
  delay = 0,
  initiallyStable = false,
  ...props
}) {
  const { ref: localRef, isInView } = useIsInView(ref, {
    inView,
    inViewOnce,
    inViewMargin,
  });

  // Validar que number es válido
  const validNumber = typeof number === 'number' && !isNaN(number) ? number : 0;
  const numberStr = validNumber.toString();
  const decimals =
    typeof decimalPlaces === 'number'
      ? decimalPlaces
      : numberStr.includes('.')
        ? (numberStr.split('.')[1]?.length ?? 0)
        : 0;

  const motionVal = useMotionValue(initiallyStable ? validNumber : fromNumber);
  const springVal = useSpring(motionVal, transition);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isInView) motionVal.set(validNumber);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [isInView, validNumber, motionVal, delay]);

  React.useEffect(() => {
    const unsubscribe = springVal.on('change', (latest) => {
      if (localRef.current) {
        let formatted =
          decimals > 0
            ? latest.toFixed(decimals)
            : Math.round(latest).toString();

        if (decimals > 0) {
          formatted = formatted.replace('.', decimalSeparator);
        }

        if (padStart) {
          const finalIntLength = Math.floor(Math.abs(validNumber)).toString().length;
          const [intPart, fracPart] = formatted.split(decimalSeparator);
          const paddedInt = intPart?.padStart(finalIntLength, '0') ?? '';
          formatted = fracPart
            ? `${paddedInt}${decimalSeparator}${fracPart}`
            : paddedInt;
        }

        localRef.current.textContent = formatted;
      }
    });
    return () => unsubscribe();
  }, [springVal, decimals, padStart, validNumber, decimalSeparator, localRef]);

  const finalIntLength = Math.floor(Math.abs(validNumber)).toString().length;

  const formatValue = (val) => {
    let out = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
    if (decimals > 0) out = out.replace('.', decimalSeparator);
    if (padStart) {
      const [intPart, fracPart] = out.split(decimalSeparator);
      const paddedInt = (intPart ?? '').padStart(finalIntLength, '0');
      out = fracPart ? `${paddedInt}${decimalSeparator}${fracPart}` : paddedInt;
    }
    return out;
  };

  const zeroText = padStart
    ? '0'.padStart(finalIntLength, '0') +
      (decimals > 0 ? decimalSeparator + '0'.repeat(decimals) : '')
    : '0' + (decimals > 0 ? decimalSeparator + '0'.repeat(decimals) : '');

  const initialText = initiallyStable ? formatValue(validNumber) : zeroText;

  return (
    <span ref={localRef} data-slot="counting-number" {...props}>
      {initialText}
    </span>
  );
}

export { CountingNumber };
