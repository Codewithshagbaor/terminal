
export enum WagerStatus {
    ESCROW = 'ESCROW',
    PENDING = 'PENDING',
    SETTLED = 'SETTLED',
    DISPUTED = 'DISPUTED'
}

export interface WagerParticipant {
    name: string;
    address: string;
    hasJoined?: boolean;
}

export interface WagerHistoryEntry {
    status: WagerStatus;
    timestamp: number;
    message: string;
}

export interface Wager {
    id: string;
    creator: string;
    // Added 'opponent' to support 1v1 terminal view and mock data
    opponent: string;
    participants: WagerParticipant[];
    amount: number;
    description: string;
    status: WagerStatus;
    winner?: string;
    timestamp: number;
    disputed?: boolean;
    history?: WagerHistoryEntry[];
    isOpenJoin?: boolean;
}

export interface FeedItem {
    id: string;
    message: string;
    amount: number;
    type: 'settlement' | 'creation' | 'dispute';
    timestamp: number;
}