"use client";

import { useCallback, useEffect, useState } from "react";
import { CAMPUS_CENTER, type Coordinates } from "@/lib/geo/campus";

export type LocationPermission = "prompt" | "granted" | "denied" | "unsupported";

export interface GeolocationState {
  coords: Coordinates | null;
  permission: LocationPermission;
  isLoading: boolean;
  usingFallback: boolean;
  requestLocation: () => void;
}

const STORAGE_KEY = "study-spot-location-prompted";

export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [permission, setPermission] = useState<LocationPermission>("prompt");
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const applyFallback = useCallback(() => {
    setCoords(CAMPUS_CENTER);
    setUsingFallback(true);
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermission("unsupported");
      applyFallback();
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPermission("granted");
        setUsingFallback(false);
        setIsLoading(false);
        localStorage.setItem(STORAGE_KEY, "granted");
      },
      () => {
        setPermission("denied");
        applyFallback();
        setIsLoading(false);
        localStorage.setItem(STORAGE_KEY, "denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [applyFallback]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermission("unsupported");
      applyFallback();
      return;
    }

    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted") {
          requestLocation();
        } else if (result.state === "denied") {
          setPermission("denied");
          applyFallback();
        }
      })
      .catch(() => {
        /* Permissions API unavailable — wait for user prompt */
      });
  }, [applyFallback, requestLocation]);

  return { coords, permission, isLoading, usingFallback, requestLocation };
}

export function shouldShowLocationPrompt(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}

export function dismissLocationPrompt(): void {
  localStorage.setItem(STORAGE_KEY, "dismissed");
}
