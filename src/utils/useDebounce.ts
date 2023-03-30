import { useEffect, useState, useRef } from "react";

export function useDebounce<T>(
  value: T,
  wait: number,
  options = { leading: false }
) {
  const [_value, setValue] = useState(value);
  const mountedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const coolDownRef = useRef(false);

  const cancel = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (mountedRef.current) {
      if (!coolDownRef.current && options.leading) {
        coolDownRef.current = true;
        setValue(value);
      } else {
        cancel();
        timeoutRef.current = window.setTimeout(() => {
          coolDownRef.current = false;
          setValue(value);
        }, wait);
      }
    }
  }, [value, options.leading, wait]);

  useEffect(() => {
    mountedRef.current = true;
    return cancel;
  }, []);

  return [_value, cancel] as const;
}
