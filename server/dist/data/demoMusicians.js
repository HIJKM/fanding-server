"use strict";
/**
 * Demo Musicians Data
 * These are pre-populated musician profiles for demo purposes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDemoMusician = exports.DEMO_MUSICIANS = void 0;
exports.DEMO_MUSICIANS = [
    {
        _id: 'demo-001',
        userId: 'demo-user-001',
        musicianName: 'BLACKPINK',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000001',
        isTokenDeployed: true,
        tokenAddress: '0xDemoBlackpink000000000000000000000000001',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-002',
        userId: 'demo-user-002',
        musicianName: 'BTS',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000002',
        isTokenDeployed: true,
        tokenAddress: '0xDemoBts00000000000000000000000000000002',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-003',
        userId: 'demo-user-003',
        musicianName: 'NewJeans',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000003',
        isTokenDeployed: true,
        tokenAddress: '0xDemoNewjeans000000000000000000000000003',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-004',
        userId: 'demo-user-004',
        musicianName: 'IVE',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000004',
        isTokenDeployed: true,
        tokenAddress: '0xDemoIve000000000000000000000000000004',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-005',
        userId: 'demo-user-005',
        musicianName: 'Stray Kids',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000005',
        isTokenDeployed: true,
        tokenAddress: '0xDemoStrayKids00000000000000000000000005',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-006',
        userId: 'demo-user-006',
        musicianName: 'SEVENTEEN',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000006',
        isTokenDeployed: true,
        tokenAddress: '0xDemoSeventeen0000000000000000000000006',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-007',
        userId: 'demo-user-007',
        musicianName: 'TWICE',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000007',
        isTokenDeployed: true,
        tokenAddress: '0xDemoTwice000000000000000000000000000007',
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-008',
        userId: 'demo-user-008',
        musicianName: 'Red Velvet',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000008',
        isTokenDeployed: true,
        tokenAddress: '0xDemoRedvelvet0000000000000000000000008',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-009',
        userId: 'demo-user-009',
        musicianName: 'Aespa',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000009',
        isTokenDeployed: true,
        tokenAddress: '0xDemoAespa00000000000000000000000000009',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'demo-010',
        userId: 'demo-user-010',
        musicianName: 'EXO',
        genre: 'K-POP',
        walletAddress: '0xDemo0000000000000000000000000000000010',
        isTokenDeployed: true,
        tokenAddress: '0xDemoExo0000000000000000000000000000010',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
];
const isDemoMusician = (musicianId) => {
    if (!musicianId)
        return false;
    return musicianId.startsWith('demo-');
};
exports.isDemoMusician = isDemoMusician;
//# sourceMappingURL=demoMusicians.js.map