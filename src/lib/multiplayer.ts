"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeGetSessionStorage,
  safeSetSessionStorage,
} from "./safeStorage";

export type HitSpark = {
  id: string;
  pos: [number, number, number];
  text: string;
  time: number;
};

export type CharacterModelType = "male_hoodie" | "female_casual";

export type PlayerData = {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  modelType?: CharacterModelType;
  pos: [number, number, number];
  rot: number;
  speed: number;
  isSprinting: boolean;
  onGround?: boolean;
  isPunching?: boolean;
  isHit?: boolean;
  emote?: string;
  emoteTime?: number;
  lastUpdate: number;
};

export const PALETTES = [
  { color: "#f97316", accent: "#fb923c", name: "Blaze" },
  { color: "#10b981", accent: "#34d399", name: "Emerald" },
  { color: "#a855f7", accent: "#c084fc", name: "Nebula" },
  { color: "#f43f5e", accent: "#fb7185", name: "Crimson" },
  { color: "#eab308", accent: "#facc15", name: "Solar" },
  { color: "#06b6d4", accent: "#38bdf8", name: "Cyber" },
  { color: "#ec4899", accent: "#f472b6", name: "Pulse" },
];

const COMIC_HITS = ["POW!", "BAM!", "WHAM!", "K.O!", "SMASH!"];

function getOrCreateLocalPlayer(): {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  modelType: CharacterModelType;
} {
  if (typeof window === "undefined") {
    return {
      id: "local",
      name: "Guest #01",
      color: "#06b6d4",
      accentColor: "#38bdf8",
      modelType: "male_hoodie",
    };
  }

  // Use safe sessionStorage / localStorage
  let id = safeGetSessionStorage("portfolio_player_id");
  let customName = safeGetLocalStorage("portfolio_custom_username");
  let sessionName = safeGetSessionStorage("portfolio_player_name");
  let paletteIdxStr = safeGetSessionStorage("portfolio_player_palette");
  let savedModel = (safeGetLocalStorage("portfolio_character_model") ||
    safeGetSessionStorage("portfolio_character_model")) as CharacterModelType;
  let modelType: CharacterModelType = savedModel === "female_casual" ? "female_casual" : "male_hoodie";

  let paletteIdx = 0;
  if (!id) {
    id = "p_" + Math.random().toString(36).substring(2, 8);
    safeSetSessionStorage("portfolio_player_id", id);
    paletteIdx = Math.floor(Math.random() * PALETTES.length);
    safeSetSessionStorage("portfolio_player_palette", paletteIdx.toString());
  } else {
    paletteIdx = parseInt(paletteIdxStr || "0", 10) % PALETTES.length;
  }

  const finalName = customName || sessionName || `${PALETTES[paletteIdx].name} #${id.slice(-3).toUpperCase()}`;
  safeSetSessionStorage("portfolio_player_name", finalName);

  return {
    id,
    name: finalName,
    color: PALETTES[paletteIdx].color,
    accentColor: PALETTES[paletteIdx].accent,
    modelType,
  };
}

export const MAX_PLAYERS = 10;
export const MAX_REMOTE_PLAYERS = MAX_PLAYERS - 1; // 9 remote + 1 local = 10 max

export function useMultiplayer() {
  const [localPlayer, setLocalPlayer] = useState(getOrCreateLocalPlayer);
  const [remotePlayers, setRemotePlayers] = useState<Map<string, PlayerData>>(new Map());
  const [currentEmote, setCurrentEmote] = useState<string | null>(null);
  const [isLocalPunching, setIsLocalPunching] = useState(false);
  const [isLocalHit, setIsLocalHit] = useState(false);
  const [punchesLanded, setPunchesLanded] = useState(0);
  const [hitSparks, setHitSparks] = useState<HitSpark[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const playersMapRef = useRef<Map<string, PlayerData>>(new Map());
  const lastBroadcastRef = useRef<number>(0);
  const emoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const punchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Callback registered by World physics to handle incoming knockback
  const onKnockbackRef = useRef<((dir: [number, number], force: number) => void) | null>(null);

  const registerKnockbackHandler = useCallback((fn: (dir: [number, number], force: number) => void) => {
    onKnockbackRef.current = fn;
  }, []);

  // Spawn visual 3D comic impact spark
  const addHitSpark = useCallback((pos: [number, number, number], text?: string) => {
    const sparkText = text || COMIC_HITS[Math.floor(Math.random() * COMIC_HITS.length)];
    const spark: HitSpark = {
      id: Math.random().toString(36).substring(2, 9),
      pos,
      text: sparkText,
      time: Date.now(),
    };
    setHitSparks((prev) => [...prev.slice(-6), spark]);

    setTimeout(() => {
      setHitSparks((prev) => prev.filter((s) => s.id !== spark.id));
    }, 1200);
  }, []);

  // Send an emote reaction
  const triggerEmote = useCallback(
    (emoji: string) => {
      setCurrentEmote(emoji);
      if (emoteTimerRef.current) clearTimeout(emoteTimerRef.current);
      emoteTimerRef.current = setTimeout(() => {
        setCurrentEmote(null);
      }, 6000);

      const payload = {
        type: "emote",
        id: localPlayer.id,
        emote: emoji,
        time: Date.now(),
      };

      try {
        channelRef.current?.postMessage(payload);
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify(payload));
        }
      } catch {
        // ignore
      }
    },
    [localPlayer.id]
  );

  // Trigger punch action
  const triggerPunch = useCallback(() => {
    setIsLocalPunching(true);
    if (punchTimerRef.current) clearTimeout(punchTimerRef.current);
    punchTimerRef.current = setTimeout(() => {
      setIsLocalPunching(false);
    }, 280);

    const payload = {
      type: "punch",
      id: localPlayer.id,
      time: Date.now(),
    };

    try {
      channelRef.current?.postMessage(payload);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
      }
    } catch {
      // ignore
    }
  }, [localPlayer.id]);

  // Trigger hit on another player
  const triggerHit = useCallback(
    (targetId: string, dir: [number, number], force: number, sparkPos: [number, number, number]) => {
      setPunchesLanded((prev) => prev + 1);
      addHitSpark(sparkPos);

      const payload = {
        type: "hit",
        attackerId: localPlayer.id,
        targetId,
        dir,
        force,
        sparkPos,
        time: Date.now(),
      };

      try {
        channelRef.current?.postMessage(payload);
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify(payload));
        }
      } catch {
        // ignore
      }
    },
    [localPlayer.id, addHitSpark]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleIncomingMessage = (data: any) => {
      if (!data) return;

      if (data.type === "state" && data.id !== localPlayer.id) {
        const map = playersMapRef.current;
        const existing = map.get(data.id);
        // Enforce maximum 10 players in arena for peak 60 FPS performance
        if (!existing && map.size >= MAX_REMOTE_PLAYERS) {
          return;
        }
        map.set(data.id, {
          ...data,
          isPunching: existing?.isPunching || data.isPunching,
          isHit: existing?.isHit || data.isHit,
          lastUpdate: Date.now(),
        });
        setRemotePlayers(new Map(map));
      } else if (data.type === "leave" && data.id !== localPlayer.id) {
        const map = playersMapRef.current;
        map.delete(data.id);
        setRemotePlayers(new Map(map));
      } else if (data.type === "emote" && data.id !== localPlayer.id) {
        const map = playersMapRef.current;
        const p = map.get(data.id);
        if (p) {
          p.emote = data.emote;
          p.emoteTime = data.time;
          setRemotePlayers(new Map(map));
        }
      } else if (data.type === "punch" && data.id !== localPlayer.id) {
        // Another player threw a punch: animate their character
        const map = playersMapRef.current;
        const p = map.get(data.id);
        if (p) {
          p.isPunching = true;
          setRemotePlayers(new Map(map));
          setTimeout(() => {
            if (p) {
              p.isPunching = false;
              setRemotePlayers(new Map(playersMapRef.current));
            }
          }, 280);
        }
      } else if (data.type === "hit") {
        // A hit occurred!
        if (data.sparkPos) {
          addHitSpark(data.sparkPos);
        }

        // If WE are the target being hit by someone else!
        if (data.targetId === localPlayer.id) {
          setIsLocalHit(true);
          if (hitTimerRef.current) clearTimeout(hitTimerRef.current);
          hitTimerRef.current = setTimeout(() => {
            setIsLocalHit(false);
          }, 380);

          // Apply knockback impulse to local physics!
          if (onKnockbackRef.current && data.dir) {
            onKnockbackRef.current(data.dir, data.force || 8.0);
          }
        } else {
          // If a remote player was hit, animate them staggering
          const map = playersMapRef.current;
          const p = map.get(data.targetId);
          if (p) {
            p.isHit = true;
            setRemotePlayers(new Map(map));
            setTimeout(() => {
              if (p) {
                p.isHit = false;
                setRemotePlayers(new Map(playersMapRef.current));
              }
            }, 380);
          }
        }
      }
    };

    // 1. BroadcastChannel for instant zero-config multi-tab communication on the same machine
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("portfolio_multiverse");
      channelRef.current = bc;
      bc.onmessage = (event) => handleIncomingMessage(event.data);
    } catch {
      // BroadcastChannel not supported in some older environments
    }

    // 2. WebSocket for cross-device network communication
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname || "localhost";
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || (host === "localhost" || host === "127.0.0.1" ? `${protocol}//${host}:3001` : null);

      if (wsUrl) {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleIncomingMessage(data);
          } catch {
            // ignore parsing error
          }
        };

        ws.onerror = () => {
          // Safe silent fallback: when deployed without WS backend, gracefully fall back to BroadcastChannel
        };

        ws.onclose = () => {
          socketRef.current = null;
        };
      }
    } catch {
      // WebSocket server fallback to BroadcastChannel
    }

    // 3. Stale player cleanup timer (removes players inactive for > 4.5 seconds)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const map = playersMapRef.current;

      for (const [id, player] of map.entries()) {
        if (now - player.lastUpdate > 4500) {
          map.delete(id);
          changed = true;
        } else if (player.emote && player.emoteTime && now - player.emoteTime > 6000) {
          player.emote = undefined;
          changed = true;
        }
      }

      if (changed) {
        setRemotePlayers(new Map(map));
      }
    }, 1000);

    // Notify others on leave
    const handleBeforeUnload = () => {
      const payload = { type: "leave", id: localPlayer.id };
      try {
        bc?.postMessage(payload);
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(cleanupInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
      bc?.close();
      ws?.close();
    };
  }, [localPlayer.id, addHitSpark]);

  // Function called on every frame / throttled tick to broadcast local player state
  const broadcastLocalState = useCallback(
    (
      pos: [number, number, number],
      rot: number,
      speed: number,
      isSprinting: boolean,
      onGround?: boolean
    ) => {
      const now = performance.now();
      // Throttle broadcast to ~25Hz (every 40ms) to conserve bandwidth and CPU
      if (now - lastBroadcastRef.current < 40) return;
      lastBroadcastRef.current = now;

      const payload: PlayerData & { type: string } = {
        type: "state",
        id: localPlayer.id,
        name: localPlayer.name,
        color: localPlayer.color,
        accentColor: localPlayer.accentColor,
        modelType: localPlayer.modelType || "male_hoodie",
        pos,
        rot,
        speed,
        isSprinting,
        onGround,
        isPunching: isLocalPunching,
        isHit: isLocalHit,
        emote: currentEmote || undefined,
        emoteTime: currentEmote ? Date.now() : undefined,
        lastUpdate: Date.now(),
      };

      try {
        channelRef.current?.postMessage(payload);
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify(payload));
        }
      } catch {
        // ignore
      }
    },
    [localPlayer, currentEmote, isLocalPunching, isLocalHit]
  );

  const updateLocalPlayerProfile = useCallback(
    (newName: string, newColor?: string, newAccent?: string, newModel?: CharacterModelType) => {
      setLocalPlayer((prev) => {
        const trimmedName = newName.trim();
        const updated = {
          ...prev,
          name: trimmedName || prev.name,
          color: newColor || prev.color,
          accentColor: newAccent || prev.accentColor,
          modelType: newModel || prev.modelType || "male_hoodie",
        };
        if (typeof window !== "undefined") {
          safeSetSessionStorage("portfolio_player_name", updated.name);
          safeSetLocalStorage("portfolio_custom_username", updated.name);
          if (newColor) safeSetSessionStorage("portfolio_player_color", newColor);
          if (newAccent) safeSetSessionStorage("portfolio_player_accent", newAccent);
          if (newModel) {
            safeSetLocalStorage("portfolio_character_model", newModel);
            safeSetSessionStorage("portfolio_character_model", newModel);
          }
        }
        return updated;
      });
    },
    []
  );

  return {
    localPlayer,
    remotePlayers: Array.from(remotePlayers.values()).slice(0, MAX_REMOTE_PLAYERS),
    totalOnline: Math.min(MAX_PLAYERS, remotePlayers.size + 1),
    maxPlayers: MAX_PLAYERS,
    currentEmote,
    isLocalPunching,
    isLocalHit,
    punchesLanded,
    hitSparks,
    triggerEmote,
    triggerPunch,
    triggerHit,
    registerKnockbackHandler,
    broadcastLocalState,
    updateLocalPlayerProfile,
  };
}
