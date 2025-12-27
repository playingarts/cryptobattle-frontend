import WebSocket from 'ws';

export interface BotConfig {
  name: string;
  accessToken: string;
  wsUrl?: string;
  autoPlay?: boolean;
  logEvents?: boolean;
}

export interface GameState {
  state: string;
  turnForPlayer: string;
  allGamePlayers: Array<{ userId: string; username: string }>;
  userCards?: Array<{ suit: string; value: string }>;
  allowedUserCardsPlacement?: {
    additionalProperties?: Array<{ x: number; y: number }>;
  };
  gameTableCards?: {
    additionalProperties?: Record<string, unknown>;
  };
}

export interface RoomInfo {
  roomId: string;
  roomUsers: Array<{ userId: string; username: string; state: string }>;
  ownerId: string;
}

export interface GameResults {
  winnerPlayersUserIds: string[];
  playersPoints: Array<{ userId: string; points: number }>;
  areAllPlayersActive: boolean;
}

type EventHandler = (data: unknown) => void;

export class GameBot {
  private ws: WebSocket | null = null;
  private config: BotConfig;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  public userId: string = '';
  public roomId: string = '';
  public roomInfo: RoomInfo | null = null;
  public gameState: GameState | null = null;
  public results: GameResults | null = null;
  public isConnected: boolean = false;
  public isReady: boolean = false;

  constructor(config: BotConfig) {
    this.config = {
      wsUrl: 'wss://cryptobattle-backend-production.up.railway.app/api/socket',
      autoPlay: true,
      logEvents: false,
      ...config,
    };
  }

  private log(message: string, data?: unknown): void {
    if (this.config.logEvents) {
      console.log(`[${this.config.name}] ${message}`, data || '');
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.config.wsUrl}?accesstoken=${this.config.accessToken}`;
      this.ws = new WebSocket(url);

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      this.ws.on('open', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.log('Connected');
        this.startPing();
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('error', (error) => {
        this.log('WebSocket error', error);
        reject(error);
      });

      this.ws.on('close', (code, reason) => {
        this.log(`Disconnected: ${code} - ${reason}`);
        this.isConnected = false;
        this.stopPing();
      });
    });
  }

  disconnect(): void {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.send('ping', {});
    }, 20000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private send(event: string, data: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    const message = JSON.stringify({ event, data });
    this.log(`Sending: ${event}`, data);
    this.ws.send(message);
  }

  private handleMessage(rawData: string): void {
    const message = JSON.parse(rawData);
    const { event, data } = message;

    if (event !== 'timer' && event !== 'pong') {
      this.log(`Received: ${event}`, data);
    }

    // Handle built-in events
    switch (event) {
      case 'user-info':
        this.userId = data.userId;
        break;

      case 'create-room':
        this.roomId = data.roomId;
        this.send('room-info', {});
        break;

      case 'join-room':
        if (!data.error) {
          this.send('room-info', {});
        }
        break;

      case 'room-info':
      case 'room-updated':
        this.roomInfo = data;
        if (data.roomId) {
          this.roomId = data.roomId;
        }
        // Check if we're ready
        if (data.roomUsers) {
          const me = data.roomUsers.find((u: { userId: string }) => u.userId === this.userId);
          this.isReady = me?.state === 'ready';
        }
        break;

      case 'game-updated':
      case 'game-info':
        this.gameState = data;
        // Auto-play if it's our turn
        if (this.config.autoPlay && this.isMyTurn()) {
          setTimeout(() => this.autoPlayCard(), 500);
        }
        break;

      case 'game-results':
        this.results = data;
        break;
    }

    // Emit to registered handlers
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach((handler) => handler(data));

    // Emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*') || [];
    wildcardHandlers.forEach((handler) => handler(message));
  }

  on(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  waitForEvent(event: string, timeoutMs: number = 30000): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.off(event, handler);
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeoutMs);

      const handler = (data: unknown) => {
        clearTimeout(timeout);
        this.off(event, handler);
        resolve(data);
      };

      this.on(event, handler);
    });
  }

  // Game actions
  createRoom(): void {
    this.send('create-room', {});
  }

  joinRoom(roomId: string): void {
    this.send('join-room', { roomId });
  }

  setReady(ready: boolean = true): void {
    this.send('player-ready', { ready });
    this.isReady = ready;
  }

  playCard(x: number, y: number, suit: string, value: string, nftId: string = ''): void {
    this.send('play-card', {
      action: 'move',
      x,
      y,
      suit,
      value: value.toString(),
      nftId,
    });
  }

  requestGameResults(): void {
    this.send('game-results', {});
  }

  voteNextGame(wantNextGame: boolean): void {
    this.send('next-game', { wantNextGame });
  }

  // Helper methods
  isMyTurn(): boolean {
    return this.gameState?.turnForPlayer === this.userId;
  }

  getMyCards(): Array<{ suit: string; value: string }> {
    return this.gameState?.userCards || [];
  }

  getAvailablePlacements(): Array<{ x: number; y: number }> {
    return this.gameState?.allowedUserCardsPlacement?.additionalProperties || [];
  }

  private autoPlayCard(): void {
    if (!this.isMyTurn() || !this.gameState) {
      return;
    }

    const cards = this.getMyCards();
    const placements = this.getAvailablePlacements();

    if (cards.length === 0 || placements.length === 0) {
      return;
    }

    // Pick first available card and placement
    const card = cards[0];
    const placement = placements[0];

    this.log(`Auto-playing card: ${card.suit} ${card.value} at (${placement.x}, ${placement.y})`);
    this.playCard(placement.x, placement.y, card.suit, card.value);
  }

  // Wait helpers for testing
  async waitForConnection(): Promise<void> {
    if (this.isConnected) return;
    await this.waitForEvent('user-info', 10000);
  }

  async waitForRoomCreated(): Promise<string> {
    const data = await this.waitForEvent('create-room', 10000) as { roomId: string };
    return data.roomId;
  }

  async waitForRoomJoined(): Promise<void> {
    await this.waitForEvent('room-info', 10000);
  }

  async waitForGameStart(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for game start'));
      }, 60000);

      const checkState = (data: GameState) => {
        if (data.state === 'started') {
          clearTimeout(timeout);
          this.off('game-updated', checkState as EventHandler);
          resolve();
        }
      };

      // Check current state
      if (this.gameState?.state === 'started') {
        clearTimeout(timeout);
        resolve();
        return;
      }

      this.on('game-updated', checkState as EventHandler);
    });
  }

  async waitForGameEnd(): Promise<GameResults> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for game end'));
      }, 120000);

      const checkResults = (data: GameResults) => {
        clearTimeout(timeout);
        this.off('game-results', checkResults as EventHandler);
        resolve(data);
      };

      // Check if already have results
      if (this.results) {
        clearTimeout(timeout);
        resolve(this.results);
        return;
      }

      this.on('game-results', checkResults as EventHandler);
    });
  }
}

export default GameBot;
